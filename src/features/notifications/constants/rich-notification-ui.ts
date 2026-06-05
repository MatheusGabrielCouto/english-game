import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory'

/** Android notification accent per loot rarity. */
export const RICH_LOOT_ANDROID_COLORS: Record<LootBoxRarityValue, string> = {
  [LootBoxRarity.COMMON]: '#71717a',
  [LootBoxRarity.UNCOMMON]: '#22c55e',
  [LootBoxRarity.RARE]: '#38bdf8',
  [LootBoxRarity.EPIC]: '#8b5cf6',
  [LootBoxRarity.LEGENDARY]: '#fbbf24',
  [LootBoxRarity.MYTHIC]: '#fbbf24',
  [LootBoxRarity.ANCIENT]: '#ef4444',
}

export const RICH_ACHIEVEMENT_ANDROID_COLOR = '#8b5cf6'

export const RICH_LOOT_MIN_RARITIES: LootBoxRarityValue[] = [
  LootBoxRarity.EPIC,
  LootBoxRarity.LEGENDARY,
  LootBoxRarity.MYTHIC,
  LootBoxRarity.ANCIENT,
]

export const RICH_NOTIFICATION_DEFAULTS = {
  achievementHero: '🏆',
  achievementTitle: 'Conquista desbloqueada!',
  lootHero: '📦',
  lootTitle: 'Nova caixa surpresa!',
  lootProgressTitle: 'Caixas no inventário',
  achievementProgressHero: '🏆',
  achievementProgressTitle: 'Conquista ao alcance',
} as const

export const ANDROID_DELIGHT_CHANNEL_ID = 'delight'
