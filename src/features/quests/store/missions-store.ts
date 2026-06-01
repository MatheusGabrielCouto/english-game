import { create } from 'zustand'

import { usePlayerStore } from '@/features/player'
import { StudyService } from '@/features/weekly-quests/services/study-service'
import { GameEvents } from '@/services/game-events'
import { getMissionsByDate, setMissionCompleted } from '@/storage/repositories/missions-repository'
import type { Mission } from '@/types/mission'
import { runAfterInteractions, runInBackground } from '@/utils/defer-work'

import { resetDailyMissionsInDatabase } from '../services/reset-daily-missions'
import { getTodayKey } from '../utils/date'

const completingMissionIds = new Set<string>()
let dailySyncPromise: Promise<void> | null = null

type MissionsState = {
  missions: Mission[]
  missionsDate: string
  _hasHydrated: boolean
  isSyncing: boolean
  completingMissionId: string | null
  ensureDailyMissions: () => void
  completeMission: (id: string) => boolean
  setHasHydrated: (value: boolean) => void
}

const syncDailyMissionsFromDatabase = async (): Promise<void> => {
  const today = getTodayKey()
  let missions = await getMissionsByDate(today)

  if (missions.length === 0) {
    const reset = await resetDailyMissionsInDatabase()
    missions = reset.missions
  }

  useMissionsStore.setState({
    missions,
    missionsDate: today,
    isSyncing: false,
  })
}

export const useMissionsStore = create<MissionsState>()((set, get) => ({
  missions: [],
  missionsDate: getTodayKey(),
  _hasHydrated: false,
  isSyncing: false,
  completingMissionId: null,

  ensureDailyMissions: () => {
    const today = getTodayKey()
    const { missionsDate, missions, isSyncing } = get()

    if (missionsDate === today && missions.length > 0) {
      return
    }

    if (isSyncing && dailySyncPromise) {
      return
    }

    if (dailySyncPromise) {
      return
    }

    set({ isSyncing: true })

    dailySyncPromise = syncDailyMissionsFromDatabase()
      .catch((error) => {
        console.warn('[missions] sync failed:', error)
        set({ isSyncing: false })
      })
      .finally(() => {
        dailySyncPromise = null
      })
  },

  completeMission: (id) => {
    if (completingMissionIds.has(id)) return false

    const { missions, missionsDate } = get()
    const mission = missions.find((m) => m.id === id)
    if (!mission || mission.completed) return false

    completingMissionIds.add(id)

    set({
      completingMissionId: id,
      missions: missions.map((m) => (m.id === id ? { ...m, completed: true } : m)),
    })

    runAfterInteractions(() => {
      usePlayerStore.getState().addMissionRewards(mission.xpReward, mission.coinReward)

      GameEvents.emit({
        type: 'DAILY_MISSION_COMPLETED',
        category: mission.category,
        missionTitle: mission.title,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
      })

      completingMissionIds.delete(id)
      if (get().completingMissionId === id) {
        set({ completingMissionId: null })
      }

      runInBackground('mission_complete', async () => {
        await setMissionCompleted(missionsDate, id, true)
        await StudyService.recordStudyDay()
      })
    })

    return true
  },

  setHasHydrated: (value) => set({ _hasHydrated: value }),
}))
