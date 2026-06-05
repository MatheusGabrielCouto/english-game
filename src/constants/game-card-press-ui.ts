export type GameCardVariant = 'default' | 'hero' | 'quest' | 'reward' | 'danger'

export type GameCardPressGlowConfig = {
  ripple: string
  border: string
  rippleScaleTo: number
  borderOpacityTo: number
}

/** Press ripple + border glow per `GameCard` variant. */
export const GAME_CARD_PRESS_GLOW: Record<GameCardVariant, GameCardPressGlowConfig> = {
  hero: {
    ripple: 'rgba(139, 92, 246, 0.42)',
    border: 'rgba(167, 139, 250, 0.95)',
    rippleScaleTo: 1.06,
    borderOpacityTo: 0.9,
  },
  quest: {
    ripple: 'rgba(56, 189, 248, 0.32)',
    border: 'rgba(56, 189, 248, 0.85)',
    rippleScaleTo: 1.05,
    borderOpacityTo: 0.75,
  },
  reward: {
    ripple: 'rgba(251, 191, 36, 0.34)',
    border: 'rgba(251, 191, 36, 0.9)',
    rippleScaleTo: 1.05,
    borderOpacityTo: 0.8,
  },
  danger: {
    ripple: 'rgba(239, 68, 68, 0.3)',
    border: 'rgba(239, 68, 68, 0.85)',
    rippleScaleTo: 1.04,
    borderOpacityTo: 0.75,
  },
  default: {
    ripple: 'rgba(139, 92, 246, 0.22)',
    border: 'rgba(167, 139, 250, 0.7)',
    rippleScaleTo: 1.04,
    borderOpacityTo: 0.65,
  },
}

export const GAME_CARD_PRESS_SPRING = {
  damping: 16,
  stiffness: 320,
} as const
