import type { LootBoxRarityValue } from '@/types/inventory'

/** Tier 1 — celebrações de alta frequência (confetti, level up, missão, conquista). */
export const CELEBRATION_LOTTIE_TIER1 = {
  confetti: require('../../../../assets/lottie/confetti.json'),
  sparkle: require('../../../../assets/lottie/sparkle.json'),
  success: require('../../../../assets/lottie/success.json'),
  achievement: require('../../../../assets/lottie/achievement.json'),
} as const

/** Tier 2 — momentos épicos (prestígio, evolução pet, loot épico/lendário). */
export const CELEBRATION_LOTTIE_TIER2 = {
  prestige: require('../../../../assets/lottie/prestige.json'),
  petEvolution: require('../../../../assets/lottie/pet-evolution.json'),
  lootEpic: require('../../../../assets/lottie/loot-epic.json'),
  lootLegendary: require('../../../../assets/lottie/loot-legendary.json'),
} as const

export const CELEBRATION_LOTTIE_SOURCES = {
  ...CELEBRATION_LOTTIE_TIER1,
  ...CELEBRATION_LOTTIE_TIER2,
} as const

export type CelebrationLottieKind = keyof typeof CELEBRATION_LOTTIE_SOURCES

export type CelebrationLottieTier = 1 | 2

export const CELEBRATION_LOTTIE_TIMING = {
  confetti: { loop: false, speed: 1.1, durationMs: 2400, tier: 1 },
  sparkle: { loop: false, speed: 1.25, durationMs: 1500, tier: 1 },
  success: { loop: false, speed: 1.35, durationMs: 1200, tier: 1 },
  achievement: { loop: false, speed: 1.15, durationMs: 1600, tier: 1 },
  prestige: { loop: false, speed: 1.1, durationMs: 1800, tier: 2 },
  petEvolution: { loop: false, speed: 1.05, durationMs: 2000, tier: 2 },
  lootEpic: { loop: false, speed: 1.2, durationMs: 1400, tier: 2 },
  lootLegendary: { loop: false, speed: 1.15, durationMs: 1800, tier: 2 },
} as const satisfies Record<
  CelebrationLottieKind,
  { loop: boolean; speed: number; durationMs: number; tier: CelebrationLottieTier }
>

const LOOT_TIER2_RARITIES: LootBoxRarityValue[] = ['epic', 'legendary', 'mythic', 'ancient']

export const isLootTier2Rarity = (rarity: LootBoxRarityValue): boolean =>
  LOOT_TIER2_RARITIES.includes(rarity)

export const getLootCelebrationLottieKind = (
  rarity: LootBoxRarityValue,
): 'lootEpic' | 'lootLegendary' | null => {
  if (rarity === 'epic') return 'lootEpic'
  if (rarity === 'legendary' || rarity === 'mythic' || rarity === 'ancient') return 'lootLegendary'
  return null
}

export const resolveLootRevealLottieKind = (
  boxRarity: LootBoxRarityValue,
  rewardRarity?: LootBoxRarityValue,
): 'lootEpic' | 'lootLegendary' | null => {
  const rewardKind = rewardRarity ? getLootCelebrationLottieKind(rewardRarity) : null
  if (rewardKind === 'lootLegendary') return 'lootLegendary'
  const boxKind = getLootCelebrationLottieKind(boxRarity)
  if (boxKind === 'lootLegendary') return 'lootLegendary'
  return rewardKind ?? boxKind
}
