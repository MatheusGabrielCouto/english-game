import { AppState, Platform, type AppStateStatus } from 'react-native'
import { requestWidgetUpdate } from 'react-native-android-widget'

import type { GameEvent } from '@/services/game-events'
import { GameEvents } from '@/services/game-events'
import { debounce } from '@/utils/debounce'

import { QUEST_PROGRESS_WIDGET_NAME } from './constants'
import { renderQuestProgressWidget } from './QuestProgressWidget'
import {
    buildWidgetSnapshot,
    loadWidgetSnapshot,
    saveWidgetSnapshot,
    type QuestProgressWidgetSnapshot,
} from './widget-snapshot'

let initialized = false
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null

const pushWidgetUpdate = async (snapshot: QuestProgressWidgetSnapshot) => {
  if (Platform.OS !== 'android') return

  await requestWidgetUpdate({
    widgetName: QUEST_PROGRESS_WIDGET_NAME,
    renderWidget: () => renderQuestProgressWidget(snapshot),
  })
}

const syncWidgetSnapshot = async () => {
  if (Platform.OS !== 'android') return

  const snapshot = buildWidgetSnapshot()
  await saveWidgetSnapshot(snapshot)
  await pushWidgetUpdate(snapshot)
}

const scheduleWidgetSync = debounce(() => {
  void syncWidgetSnapshot()
}, 400)

const handleAppStateChange = (nextState: AppStateStatus) => {
  if (nextState === 'active') {
    scheduleWidgetSync()
  }
}

const handleGameEvent = (event: GameEvent) => {
  switch (event.type) {
    case 'DAILY_MISSION_COMPLETED':
    case 'STUDY_DAY_RECORDED':
    case 'PLAYER_LEVEL_UP':
      scheduleWidgetSync()
      break
    default:
      break
  }
}

export const AndroidWidgetService = {
  init: () => {
    if (initialized || Platform.OS !== 'android') return
    initialized = true
    GameEvents.subscribe(handleGameEvent)
    appStateSubscription?.remove()
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange)
  },

  dispose: () => {
    appStateSubscription?.remove()
    appStateSubscription = null
    initialized = false
  },

  syncNow: syncWidgetSnapshot,

  /** Garante snapshot válido no primeiro add do widget (headless). */
  ensureSnapshot: async () => {
    const existing = await loadWidgetSnapshot()
    if (existing.updatedAt !== new Date(0).toISOString()) return existing

    const snapshot = buildWidgetSnapshot()
    await saveWidgetSnapshot(snapshot)
    return snapshot
  },
}
