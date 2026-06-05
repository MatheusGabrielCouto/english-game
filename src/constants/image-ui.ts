import type { ImageProps } from 'expo-image'

/** Blurhash placeholders tuned to the dark RPG palette (P-32). */
export const IMAGE_BLURHASH = {
  default: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  hero: 'L8Q]-;01_3%M01?b9F%M8_3WB',
  loot: 'L5H2EC=PM+yV0g-mq.wG9cFMJ.rk',
  avatar: 'L5H2EC=PM+yV0g-mq.wG9cFMJ.rk',
  journal: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4',
} as const

export type ImageSurface = keyof typeof IMAGE_BLURHASH

export const IMAGE_TRANSITION_MS = 220

export const IMAGE_CACHE_POLICY: NonNullable<ImageProps['cachePolicy']> = 'memory-disk'
