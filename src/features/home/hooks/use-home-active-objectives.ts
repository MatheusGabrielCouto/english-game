import { useMemo } from 'react'

import { useContractsStore } from '@/features/contracts/store/contracts-store'
import { useEpicQuestsStore } from '@/features/epic-quests/store/epic-quests-store'
import { InventoryService } from '@/features/inventory/services/inventory-service'
import { useMetagameStore } from '@/features/metagame/store/metagame-store'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { useRoutinesStore } from '@/features/routines/store/routines-store'
import { useWeeklyMissionsStore } from '@/features/weekly-quests/store/weekly-missions-store'

import type { HomeActiveObjective } from '../types/home-active-objective'
import {
  buildHomeActiveObjectives,
  countHomeActiveObjectives,
  type HomeActiveObjectivesInput,
} from '../utils/home-active-objectives'

export type UseHomeActiveObjectivesResult = {
  objectives: HomeActiveObjective[]
  totalCount: number
  isLoading: boolean
}

export const useHomeActiveObjectives = (): UseHomeActiveObjectivesResult => {
  const missions = useMissionsStore((s) => s.missions)
  const missionsHydrated = useMissionsStore((s) => s._hasHydrated)
  const missionsSyncing = useMissionsStore((s) => s.isSyncing)
  const dueToday = useRoutinesStore((s) => s.dueToday)
  const routinesLoading = useRoutinesStore((s) => s.isLoading)
  const weeklyMissions = useWeeklyMissionsStore((s) => s.missions)
  const weeklyLoading = useWeeklyMissionsStore((s) => s.isLoading)
  const activeContract = useContractsStore((s) => s.activeContract)
  const epicMissions = useEpicQuestsStore((s) => s.missions)
  const claimableSeasonTiers = useMetagameStore((s) => s.claimableSeasonTiers)

  const input = useMemo<HomeActiveObjectivesInput>(
    () => ({
      missions,
      dueToday,
      weeklyMissions,
      activeContract,
      unopenedLoot: InventoryService.getCachedSnapshot()?.lootBoxes.total ?? 0,
      epicMissions,
      claimableSeasonTiers,
    }),
    [
      activeContract,
      claimableSeasonTiers,
      dueToday,
      epicMissions,
      missions,
      weeklyMissions,
    ],
  )

  const objectives = useMemo(() => buildHomeActiveObjectives(input), [input])
  const totalCount = useMemo(() => countHomeActiveObjectives(input), [input])

  return {
    objectives,
    totalCount,
    isLoading: !missionsHydrated || missionsSyncing || routinesLoading || weeklyLoading,
  }
}
