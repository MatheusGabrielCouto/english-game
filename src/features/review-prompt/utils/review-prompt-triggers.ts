import type { GameEvent } from '@/services/game-events'
import { LootBoxRarity } from '@/types/inventory'

import { REVIEW_PROMPT_MOMENTS, type ReviewPromptMoment } from '../constants/review-prompt-ui'

export const STREAK_REVIEW_TARGET = 7

export const resolveReviewMomentFromGameEvent = (
  event: GameEvent,
  currentStreak: number,
): ReviewPromptMoment | null => {
  if (event.type === 'STUDY_DAY_RECORDED' && currentStreak === STREAK_REVIEW_TARGET) {
    return REVIEW_PROMPT_MOMENTS.STREAK_7
  }

  if (
    event.type === 'LOOT_BOX_OPENED' &&
    event.result.boxRarity === LootBoxRarity.LEGENDARY
  ) {
    return REVIEW_PROMPT_MOMENTS.LOOT_LEGENDARY
  }

  return null
}
