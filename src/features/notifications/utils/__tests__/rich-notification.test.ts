import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LootBoxRarity } from '@/types/inventory'
import { NotificationCategory } from '@/types/notification'

import { RICH_NOTIFICATION_DEFAULTS } from '../../constants/rich-notification-ui'
import { buildLootReminderRichVisual, resolveHighestLootRarity } from '../loot-rich-notification'
import {
  buildAchievementUnlockDelight,
  buildLootReceivedDelight,
} from '../rich-notification-delight'
import { buildRichNotificationPayload } from '../rich-notification-payload'

describe('rich notification (P-19)', () => {
  it('buildRichNotificationPayload puts hero emoji in subtitle', () => {
    const content = buildRichNotificationPayload({
      category: NotificationCategory.LOOT_REMINDER,
      title: 'Caixas no inventário',
      body: 'Você tem 2 caixas surpresa para abrir!',
      identifier: 'eq-loot-test',
      rich: { heroEmoji: '👑', accentColor: '#fbbf24' },
      delight: true,
    })

    assert.equal(content.subtitle, '👑')
    assert.equal(content.data.rich, true)
    assert.equal(content.data.heroEmoji, '👑')
  })

  it('achievement unlock delight uses achievement icon', () => {
    const payload = buildAchievementUnlockDelight(
      {
        type: 'ACHIEVEMENT_UNLOCKED',
        achievementKey: 'first_day',
        name: 'Primeiro Dia',
        rewards: [],
      },
      'eq-delight-achievement',
    )

    assert.equal(payload.rich?.heroEmoji, '🌱')
    assert.equal(payload.title, RICH_NOTIFICATION_DEFAULTS.achievementTitle)
    assert.equal(payload.body, 'Primeiro Dia')
    assert.equal(payload.delight, true)
  })

  it('loot delight only for epic+ rarities', () => {
    const epic = buildLootReceivedDelight(
      { type: 'LOOT_BOX_RECEIVED', rarity: LootBoxRarity.EPIC, source: 'streak' },
      'eq-delight-loot',
    )
    const common = buildLootReceivedDelight(
      { type: 'LOOT_BOX_RECEIVED', rarity: LootBoxRarity.COMMON, source: 'shop' },
      'eq-delight-loot-common',
    )

    assert.ok(epic)
    assert.equal(epic?.rich?.heroEmoji, '💎')
    assert.equal(common, null)
  })

  it('loot reminder visual picks highest rarity emoji', () => {
    const rarity = resolveHighestLootRarity([
      LootBoxRarity.COMMON,
      LootBoxRarity.LEGENDARY,
      LootBoxRarity.RARE,
    ])
    const visual = buildLootReminderRichVisual([
      LootBoxRarity.COMMON,
      LootBoxRarity.LEGENDARY,
      LootBoxRarity.RARE,
    ])

    assert.equal(rarity, LootBoxRarity.LEGENDARY)
    assert.equal(visual.heroEmoji, '👑')
  })
})
