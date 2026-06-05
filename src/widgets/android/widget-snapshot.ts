import AsyncStorage from '@react-native-async-storage/async-storage'

import { usePlayerStore } from '@/features/player/store/player-store'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { getTodayKey } from '@/features/quests/utils/date'

import { WIDGET_SNAPSHOT_STORAGE_KEY } from './constants'

export type QuestProgressWidgetSnapshot = {
  updatedAt: string
  playerName: string
  currentStreak: number
  studiedToday: boolean
  pendingMissions: number
  completedMissions: number
  totalMissions: number
  nextMissionTitle: string | null
  nextMissionXp: number
  allDone: boolean
}

export const EMPTY_WIDGET_SNAPSHOT: QuestProgressWidgetSnapshot = {
  updatedAt: new Date(0).toISOString(),
  playerName: 'Aventureiro',
  currentStreak: 0,
  studiedToday: false,
  pendingMissions: 0,
  completedMissions: 0,
  totalMissions: 0,
  nextMissionTitle: null,
  nextMissionXp: 0,
  allDone: false,
}

export const buildWidgetSnapshot = (): QuestProgressWidgetSnapshot => {
  const player = usePlayerStore.getState()
  const missions = useMissionsStore.getState().missions
  const today = getTodayKey()

  const pendingMissions = missions.filter((mission) => !mission.completed)
  const completedMissions = missions.length - pendingMissions.length
  const nextMission = pendingMissions[0] ?? null

  return {
    updatedAt: new Date().toISOString(),
    playerName: player.name?.trim() || 'Aventureiro',
    currentStreak: player.currentStreak,
    studiedToday: player.lastStudyDate === today,
    pendingMissions: pendingMissions.length,
    completedMissions,
    totalMissions: missions.length,
    nextMissionTitle: nextMission?.title ?? null,
    nextMissionXp: nextMission?.xpReward ?? 0,
    allDone: missions.length > 0 && pendingMissions.length === 0,
  }
}

export const loadWidgetSnapshot = async (): Promise<QuestProgressWidgetSnapshot> => {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_STORAGE_KEY)
    if (!raw) return EMPTY_WIDGET_SNAPSHOT
    const parsed = JSON.parse(raw) as Partial<QuestProgressWidgetSnapshot>
    return { ...EMPTY_WIDGET_SNAPSHOT, ...parsed }
  } catch {
    return EMPTY_WIDGET_SNAPSHOT
  }
}

export const saveWidgetSnapshot = async (
  snapshot: QuestProgressWidgetSnapshot,
): Promise<void> => {
  await AsyncStorage.setItem(WIDGET_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot))
}

