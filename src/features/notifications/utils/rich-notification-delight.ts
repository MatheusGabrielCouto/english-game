import type { GameEvent } from '@/services/game-events'
import { ACHIEVEMENTS_BY_KEY } from '@/features/achievements/constants/default-achievements'
import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants'
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory'
import { NotificationCategory } from '@/types/notification'

import {
  RICH_ACHIEVEMENT_ANDROID_COLOR,
  RICH_LOOT_ANDROID_COLORS,
  RICH_LOOT_MIN_RARITIES,
  RICH_NOTIFICATION_DEFAULTS,
} from '../constants/rich-notification-ui'
import type { RichNotificationContentInput } from './rich-notification-payload'

const isRichLootRarity = (rarity: string): rarity is LootBoxRarityValue =>
  RICH_LOOT_MIN_RARITIES.includes(rarity as LootBoxRarityValue)

export const buildAchievementUnlockDelight = (
  event: Extract<GameEvent, { type: 'ACHIEVEMENT_UNLOCKED' }>,
  identifier: string,
): RichNotificationContentInput => {
  const definition = ACHIEVEMENTS_BY_KEY[event.achievementKey]
  const heroEmoji = definition?.icon ?? RICH_NOTIFICATION_DEFAULTS.achievementHero

  return {
    category: NotificationCategory.ACHIEVEMENT_PROGRESS,
    title: RICH_NOTIFICATION_DEFAULTS.achievementTitle,
    body: event.name,
    identifier,
    delight: true,
    deepLinkPath: '/achievements',
    rich: {
      heroEmoji,
      accentColor: RICH_ACHIEVEMENT_ANDROID_COLOR,
    },
  }
}

export const buildLootReceivedDelight = (
  event: Extract<GameEvent, { type: 'LOOT_BOX_RECEIVED' }>,
  identifier: string,
): RichNotificationContentInput | null => {
  if (!isRichLootRarity(event.rarity)) return null

  const rarity = event.rarity as LootBoxRarityValue
  const config = LOOT_BOX_RARITY_CONFIG[rarity]

  return {
    category: NotificationCategory.LOOT_REMINDER,
    title: RICH_NOTIFICATION_DEFAULTS.lootTitle,
    body: `Você recebeu uma caixa ${config.label.toLowerCase()}! Abra no inventário.`,
    identifier,
    delight: true,
    deepLinkPath: '/loot',
    rich: {
      heroEmoji: config.emoji,
      accentColor: RICH_LOOT_ANDROID_COLORS[rarity],
    },
  }
}

export const resolveDelightFromGameEvent = (
  event: GameEvent,
  identifier: string,
): RichNotificationContentInput | null => {
  if (event.type === 'ACHIEVEMENT_UNLOCKED') {
    return buildAchievementUnlockDelight(event, identifier)
  }

  if (event.type === 'LOOT_BOX_RECEIVED') {
    return buildLootReceivedDelight(event, identifier)
  }

  return null
}
