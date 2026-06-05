import { LOOT_BOX_RARITY_CONFIG, LOOT_BOX_RARITY_ORDER } from '@/features/inventory/constants'
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory'

import {
  RICH_LOOT_ANDROID_COLORS,
  RICH_NOTIFICATION_DEFAULTS,
} from '../constants/rich-notification-ui'
import type { RichNotificationVisual } from './rich-notification-payload'

export const resolveHighestLootRarity = (
  rarities: LootBoxRarityValue[],
): LootBoxRarityValue => {
  for (const rarity of LOOT_BOX_RARITY_ORDER) {
    if (rarities.includes(rarity)) return rarity
  }
  return LootBoxRarity.COMMON
}

export const buildLootReminderRichVisual = (
  rarities: LootBoxRarityValue[],
): RichNotificationVisual => {
  const rarity = resolveHighestLootRarity(rarities)
  const config = LOOT_BOX_RARITY_CONFIG[rarity]

  return {
    heroEmoji: config.emoji ?? RICH_NOTIFICATION_DEFAULTS.lootHero,
    accentColor: RICH_LOOT_ANDROID_COLORS[rarity],
  }
}
