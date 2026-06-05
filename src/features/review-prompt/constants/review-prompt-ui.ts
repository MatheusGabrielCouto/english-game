export const REVIEW_PROMPT_STORAGE_KEY = 'eq:review-prompt-state'

/** Máximo de solicitações ao longo da vida do app (Apple/Google guidelines). */
export const REVIEW_PROMPT_MAX_COUNT = 3

/** Intervalo mínimo entre prompts (dias). */
export const REVIEW_PROMPT_COOLDOWN_DAYS = 90

/** Aguarda celebração/loot overlay antes do diálogo nativo. */
export const REVIEW_PROMPT_DELAY_MS = 3500

export const REVIEW_PROMPT_MOMENTS = {
  STREAK_7: 'streak_7',
  LOOT_LEGENDARY: 'loot_legendary',
} as const

export type ReviewPromptMoment =
  (typeof REVIEW_PROMPT_MOMENTS)[keyof typeof REVIEW_PROMPT_MOMENTS]
