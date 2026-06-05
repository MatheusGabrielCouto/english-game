import AsyncStorage from '@react-native-async-storage/async-storage'
import * as StoreReview from 'expo-store-review'
import { Platform } from 'react-native'

import { usePlayerStore } from '@/features/player'
import { AppLogService } from '@/services/app-log-service'
import type { GameEvent } from '@/services/game-events'
import { GameEvents } from '@/services/game-events'

import {
  REVIEW_PROMPT_DELAY_MS,
  REVIEW_PROMPT_STORAGE_KEY,
  type ReviewPromptMoment,
} from '../constants/review-prompt-ui'
import {
  canRequestReviewPrompt,
  EMPTY_REVIEW_PROMPT_STATE,
  nextReviewPromptState,
  type ReviewPromptState,
} from '../utils/review-prompt-eligibility'
import { resolveReviewMomentFromGameEvent } from '../utils/review-prompt-triggers'

let initialized = false
let sessionPrompted = false
let pendingTimer: ReturnType<typeof setTimeout> | null = null

const loadState = async (): Promise<ReviewPromptState> => {
  try {
    const raw = await AsyncStorage.getItem(REVIEW_PROMPT_STORAGE_KEY)
    if (!raw) return EMPTY_REVIEW_PROMPT_STATE

    const parsed = JSON.parse(raw) as Partial<ReviewPromptState>
    return {
      promptCount: typeof parsed.promptCount === 'number' ? parsed.promptCount : 0,
      lastPromptAtIso:
        typeof parsed.lastPromptAtIso === 'string' ? parsed.lastPromptAtIso : null,
    }
  } catch {
    return EMPTY_REVIEW_PROMPT_STATE
  }
}

const saveState = async (state: ReviewPromptState): Promise<void> => {
  await AsyncStorage.setItem(REVIEW_PROMPT_STORAGE_KEY, JSON.stringify(state))
}

const clearPendingTimer = (): void => {
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }
}

const requestNativeReview = async (moment: ReviewPromptMoment): Promise<void> => {
  if (Platform.OS === 'web') return
  if (sessionPrompted) return

  const state = await loadState()
  if (!canRequestReviewPrompt(state)) return

  const available = await StoreReview.isAvailableAsync()
  if (!available) return

  const hasAction = await StoreReview.hasAction()
  if (!hasAction) return

  try {
    await StoreReview.requestReview()
    sessionPrompted = true
    await saveState(nextReviewPromptState(state, new Date().toISOString()))
    AppLogService.info('review_prompt.requested', 'Store review requested after delight moment', {
      moment,
      promptCount: state.promptCount + 1,
    })
  } catch (error) {
    AppLogService.warn('review_prompt.failed', 'Store review request failed', {
      moment,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

const queueReviewPrompt = (moment: ReviewPromptMoment): void => {
  if (Platform.OS === 'web') return
  if (sessionPrompted) return

  clearPendingTimer()

  pendingTimer = setTimeout(() => {
    pendingTimer = null
    void requestNativeReview(moment)
  }, REVIEW_PROMPT_DELAY_MS)
}

const handleGameEvent = (event: GameEvent): void => {
  const moment = resolveReviewMomentFromGameEvent(
    event,
    usePlayerStore.getState().currentStreak,
  )
  if (!moment) return
  queueReviewPrompt(moment)
}

export const ReviewPromptService = {
  initialize(): void {
    if (initialized) return
    initialized = true

    GameEvents.subscribe((event) => {
      handleGameEvent(event)
    })
  },
}
