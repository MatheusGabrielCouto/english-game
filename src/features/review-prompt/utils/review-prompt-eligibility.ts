import {
  REVIEW_PROMPT_COOLDOWN_DAYS,
  REVIEW_PROMPT_MAX_COUNT,
} from '../constants/review-prompt-ui'

export type ReviewPromptState = {
  promptCount: number
  lastPromptAtIso: string | null
}

export const EMPTY_REVIEW_PROMPT_STATE: ReviewPromptState = {
  promptCount: 0,
  lastPromptAtIso: null,
}

const dayMs = 24 * 60 * 60 * 1000

export const daysSinceIso = (iso: string, reference = new Date()): number => {
  const then = new Date(iso).getTime()
  const now = reference.getTime()
  if (!Number.isFinite(then) || then > now) return Number.POSITIVE_INFINITY
  return Math.floor((now - then) / dayMs)
}

export const canRequestReviewPrompt = (
  state: ReviewPromptState,
  reference = new Date(),
): boolean => {
  if (state.promptCount >= REVIEW_PROMPT_MAX_COUNT) return false

  if (!state.lastPromptAtIso) return true

  return daysSinceIso(state.lastPromptAtIso, reference) >= REVIEW_PROMPT_COOLDOWN_DAYS
}

export const nextReviewPromptState = (
  state: ReviewPromptState,
  promptedAtIso: string,
): ReviewPromptState => ({
  promptCount: state.promptCount + 1,
  lastPromptAtIso: promptedAtIso,
})
