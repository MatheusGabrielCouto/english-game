import { useMemo } from 'react'

import { useContractsStore } from '@/features/contracts/store/contracts-store'
import { useEnglishJournalStore } from '@/features/english-journal/store/english-journal-store'
import { InventoryService } from '@/features/inventory/services/inventory-service'
import { useFarmStore } from '@/features/farm/store/farm-store'
import { useMetagameStore } from '@/features/metagame/store/metagame-store'
import { usePlayerStore, usePlayerXP } from '@/features/player'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { useRoutinesStore } from '@/features/routines/store/routines-store'
import { getPrestigeTier } from '@/features/prestige/constants/prestige-catalog'
import { useStudyPointsStore } from '@/features/study-points/store/study-points-store'

import {
  computeHomeDailyProgress,
  resolveHomeNextReward,
  type HomeDailyProgress,
  type HomeNextReward,
} from '../utils/home-dashboard'

export type HomeDashboard = {
  daily: HomeDailyProgress
  nextReward: HomeNextReward
  studyPoints: number
  prestigeLevel: number
  prestigeName: string | null
  xpCurrent: number
  xpRequired: number
}

export const useHomeDashboard = (): HomeDashboard => {
  const level = usePlayerStore((s) => s.level)
  const xp = usePlayerStore((s) => s.xp)
  const missions = useMissionsStore((s) => s.missions)
  const dueToday = useRoutinesStore((s) => s.dueToday)
  const todayStats = useFarmStore((s) => s.todayStats)
  const metagameState = useMetagameStore((s) => s.state)
  const canPrestige = useMetagameStore((s) => s.canPrestige)
  const claimableSeasonTiers = useMetagameStore((s) => s.claimableSeasonTiers)
  const studyPoints = useStudyPointsStore((s) => s.balance?.balance ?? 0)
  const { current, required } = usePlayerXP()

  const studySessions = useMemo(
    () => todayStats.reduce((sum, row) => sum + row.sessionsCount, 0),
    [todayStats],
  )

  const daily = useMemo(
    () => computeHomeDailyProgress({ missions, dueToday, studySessions }),
    [dueToday, missions, studySessions],
  )

  const nextReward = useMemo(() => {
    const snapshot = InventoryService.getCachedSnapshot()
    const unopenedLoot = snapshot?.lootBoxes.total ?? 0
    const petEggCount =
      snapshot?.specialItems.find((item) => item.itemKey === 'pet_egg')?.quantity ?? 0

    return resolveHomeNextReward({
      level,
      xp,
      unopenedLoot,
      petEggCount,
      prestigeLevel: metagameState?.prestigeLevel ?? 0,
      canPrestige,
      claimableSeasonTiers,
      playerLevel: level,
    })
  }, [canPrestige, claimableSeasonTiers, level, metagameState?.prestigeLevel, xp])

  const prestigeLevel = metagameState?.prestigeLevel ?? 0
  const prestigeTier = prestigeLevel > 0 ? getPrestigeTier(prestigeLevel) : null

  return {
    daily,
    nextReward,
    studyPoints,
    prestigeLevel,
    prestigeName: prestigeTier?.name ?? null,
    xpCurrent: current,
    xpRequired: required,
  }
}
