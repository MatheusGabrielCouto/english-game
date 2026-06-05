import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

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
  const { missions, missionsHydrated, missionsSyncing } = useMissionsStore(
    useShallow((s) => ({
      missions: s.missions,
      missionsHydrated: s._hasHydrated,
      missionsSyncing: s.isSyncing,
    })),
  )
  const { dueToday, routinesLoading } = useRoutinesStore(
    useShallow((s) => ({
      dueToday: s.dueToday,
      routinesLoading: s.isLoading,
    })),
  )
  const { weeklyMissions, weeklyLoading } = useWeeklyMissionsStore(
    useShallow((s) => ({
      weeklyMissions: s.missions,
      weeklyLoading: s.isLoading,
    })),
  )
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
