import { SharedTransition } from 'react-native-reanimated'

/**
 * Shared element tags for hero cards (Home → stack screens).
 * @see https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview/
 */
export const SHARED_TRANSITION_TAGS = {
  playerHero: 'hero-player',
  petHero: 'hero-pet',
  cityHero: 'hero-city',
  inventoryHero: 'hero-inventory',
  lootHero: 'hero-loot',
} as const

export type SharedTransitionTag =
  (typeof SHARED_TRANSITION_TAGS)[keyof typeof SHARED_TRANSITION_TAGS]

/** Reanimated 4 SET — enable via package.json `reanimated.staticFeatureFlags`. */
export const SHARED_ELEMENT_TRANSITIONS_ENABLED = true

export const heroCardSharedTransition = SharedTransition.duration(420)
