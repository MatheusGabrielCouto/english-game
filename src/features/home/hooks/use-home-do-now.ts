import { useMemo } from 'react'

import { useMissionsStore } from '@/features/quests/store/missions-store'
import type { Mission } from '@/types/mission'

export type HomeDoNowSnapshot = {
  nextMission: Mission | null
  pendingCount: number
  missionCount: number
  allDone: boolean
  hasHydrated: boolean
  isSyncing: boolean
  ensureDailyMissions: () => void
}

export const useHomeDoNow = (): HomeDoNowSnapshot => {
  const missions = useMissionsStore((s) => s.missions)
  const hasHydrated = useMissionsStore((s) => s._hasHydrated)
  const isSyncing = useMissionsStore((s) => s.isSyncing)
  const ensureDailyMissions = useMissionsStore((s) => s.ensureDailyMissions)

  const nextMission = useMemo(
    () => missions.find((mission) => !mission.completed) ?? null,
    [missions],
  )

  const pendingCount = missions.filter((mission) => !mission.completed).length
  const allDone = missions.length > 0 && pendingCount === 0

  return {
    nextMission,
    pendingCount,
    missionCount: missions.length,
    allDone,
    hasHydrated,
    isSyncing,
    ensureDailyMissions,
  }
}
