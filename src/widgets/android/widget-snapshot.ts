import AsyncStorage from '@react-native-async-storage/async-storage'

import { usePlayerStore } from '@/features/player/store/player-store'
import { getXPProgress } from '@/features/player/utils/xp'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import { getTodayKey } from '@/features/quests/utils/date'

import { WIDGET_SNAPSHOT_STORAGE_KEY, WIDGET_SNAPSHOT_VERSION } from './constants'

export type QuestProgressWidgetSnapshot = {
  schemaVersion: number
  updatedAt: string
  playerName: string
  playerTitle: string
  level: number
  xpCurrent: number
  xpRequired: number
  coins: number
  shields: number
  currentStreak: number
  studiedToday: boolean
  pendingMissions: number
  completedMissions: number
  totalMissions: number
  nextMissionTitle: string | null
  nextMissionXp: number
  nextMissionCoins: number
  secondaryMissionTitle: string | null
  remainingXpToday: number
  remainingCoinsToday: number
  allDone: boolean
}

export const EMPTY_WIDGET_SNAPSHOT: QuestProgressWidgetSnapshot = {
  schemaVersion: WIDGET_SNAPSHOT_VERSION,
  updatedAt: new Date(0).toISOString(),
  playerName: 'Aventureiro',
  playerTitle: 'Novato',
  level: 1,
  xpCurrent: 0,
  xpRequired: 100,
  coins: 0,
  shields: 0,
  currentStreak: 0,
  studiedToday: false,
  pendingMissions: 0,
  completedMissions: 0,
  totalMissions: 0,
  nextMissionTitle: null,
  nextMissionXp: 0,
  nextMissionCoins: 0,
  secondaryMissionTitle: null,
  remainingXpToday: 0,
  remainingCoinsToday: 0,
  allDone: false,
}

export const buildWidgetSnapshot = (): QuestProgressWidgetSnapshot => {
  const player = usePlayerStore.getState()
  const missions = useMissionsStore.getState().missions
  const today = getTodayKey()
  const xpProgress = getXPProgress(player.level, player.xp)

  const pendingMissions = missions.filter((mission) => !mission.completed)
  const completedMissions = missions.length - pendingMissions.length
  const nextMission = pendingMissions[0] ?? null
  const secondaryMission = pendingMissions[1] ?? null

  const remainingXpToday = pendingMissions.reduce((sum, mission) => sum + mission.xpReward, 0)
  const remainingCoinsToday = pendingMissions.reduce((sum, mission) => sum + mission.coinReward, 0)

  return {
    schemaVersion: WIDGET_SNAPSHOT_VERSION,
    updatedAt: new Date().toISOString(),
    playerName: player.name?.trim() || 'Aventureiro',
    playerTitle: player.title?.trim() || 'Novato',
    level: player.level,
    xpCurrent: xpProgress.current,
    xpRequired: xpProgress.required,
    coins: player.coins,
    shields: player.shields,
    currentStreak: player.currentStreak,
    studiedToday: player.lastStudyDate === today,
    pendingMissions: pendingMissions.length,
    completedMissions,
    totalMissions: missions.length,
    nextMissionTitle: nextMission?.title ?? null,
    nextMissionXp: nextMission?.xpReward ?? 0,
    nextMissionCoins: nextMission?.coinReward ?? 0,
    secondaryMissionTitle: secondaryMission?.title ?? null,
    remainingXpToday,
    remainingCoinsToday,
    allDone: missions.length > 0 && pendingMissions.length === 0,
  }
}

export const loadWidgetSnapshot = async (): Promise<QuestProgressWidgetSnapshot> => {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_STORAGE_KEY)
    if (!raw) return EMPTY_WIDGET_SNAPSHOT
    const parsed = JSON.parse(raw) as Partial<QuestProgressWidgetSnapshot>
    const schemaVersion = parsed.schemaVersion ?? 1
    if (schemaVersion !== WIDGET_SNAPSHOT_VERSION) {
      return EMPTY_WIDGET_SNAPSHOT
    }
    return { ...EMPTY_WIDGET_SNAPSHOT, ...parsed, schemaVersion: WIDGET_SNAPSHOT_VERSION }
  } catch {
    return EMPTY_WIDGET_SNAPSHOT
  }
}

export const saveWidgetSnapshot = async (
  snapshot: QuestProgressWidgetSnapshot,
): Promise<void> => {
  await AsyncStorage.setItem(WIDGET_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot))
}
