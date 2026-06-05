import type { GameEvent } from '@/services/game-events'
import type { LootBoxRarityValue } from '@/types/inventory'
import { LootBoxRarity } from '@/types/inventory'

import type { AudioAssetKey, AudioPoolId } from './types'

const LOOT_REVEAL_BY_RARITY: Record<LootBoxRarityValue, AudioAssetKey> = {
  [LootBoxRarity.COMMON]: 'loot_reveal_common',
  [LootBoxRarity.UNCOMMON]: 'loot_reveal_uncommon',
  [LootBoxRarity.RARE]: 'loot_reveal_rare',
  [LootBoxRarity.EPIC]: 'loot_reveal_epic',
  [LootBoxRarity.LEGENDARY]: 'loot_reveal_legendary',
  [LootBoxRarity.MYTHIC]: 'loot_reveal_mythic',
  [LootBoxRarity.ANCIENT]: 'loot_reveal_ancient',
}

export type AudioPlaybackPlan = {
  assetKey: AudioAssetKey | AudioPoolId
  family: string
  priority?: 'normal' | 'high'
  delayMs?: number
}

export type AudioEventContext = {
  allDailyMissionsComplete?: boolean
  currentStreak?: number
}

const pickXpSound = (amount: number): AudioAssetKey => {
  if (amount >= 100) return 'xp_surge'
  if (amount >= 20) return 'xp_chime'
  return 'xp_tick'
}

/** Pure resolver — does not play audio or touch stores. */
export const resolveGameEventAudio = (
  event: GameEvent,
  context: AudioEventContext = {},
): AudioPlaybackPlan[] => {
  switch (event.type) {
    case 'XP_GAINED':
      return [{ assetKey: pickXpSound(event.amount), family: 'xp' }]

    case 'PLAYER_LEVEL_UP':
      return [{ assetKey: 'level_up', family: 'level_up', priority: 'high' }]

    case 'DAILY_MISSION_COMPLETED': {
      const plans: AudioPlaybackPlan[] = [
        {
          assetKey: context.allDailyMissionsComplete ? 'mission_daily_all' : 'mission_complete',
          family: 'mission',
          priority: 'high',
        },
      ]
      if (event.coinReward && event.coinReward > 0) {
        plans.push({ assetKey: 'coin_pickup', family: 'coin', delayMs: 120 })
      }
      return plans
    }

    case 'LOCAL_MISSION_COMPLETED':
    case 'CITY_EVENT_MISSION_COMPLETED':
    case 'WEEKLY_MISSION_CLAIMED':
      return [
        { assetKey: 'mission_complete', family: 'mission', priority: 'high' },
        ...(event.type === 'LOCAL_MISSION_COMPLETED' && event.coinReward > 0
          ? [{ assetKey: 'coin_pickup' as const, family: 'coin', delayMs: 100 }]
          : []),
      ]

    case 'ROUTINE_COMPLETED':
      return [
        { assetKey: 'mission_complete', family: 'mission', priority: 'high' },
        ...(event.coins > 0
          ? [{ assetKey: 'coin_pickup' as const, family: 'coin', delayMs: 120 }]
          : []),
      ]

    case 'POI_CHAIN_STEP_CLAIMED':
      return [{ assetKey: 'xp_chime', family: 'mission_chain' }]

    case 'POI_CHAIN_COMPLETED':
      return [{ assetKey: 'mission_daily_all', family: 'mission_chain', priority: 'high' }]

    case 'STUDY_DAY_RECORDED': {
      const plans: AudioPlaybackPlan[] = [
        { assetKey: 'study_day_stamp', family: 'study_day', priority: 'high' },
      ]
      if ((context.currentStreak ?? 0) > 0) {
        plans.push({ assetKey: 'streak_flame', family: 'streak', delayMs: 280 })
      }
      return plans
    }

    case 'STREAK_BROKEN':
      return [{ assetKey: 'streak_break_wind', family: 'streak_break' }]

    case 'LOOT_BOX_RECEIVED':
      return [{ assetKey: 'loot_shake', family: 'loot_received' }]

    case 'LOOT_BOX_OPENED': {
      const rarity = event.result.boxRarity as LootBoxRarityValue
      return [
        {
          assetKey: LOOT_REVEAL_BY_RARITY[rarity] ?? 'loot_reveal_common',
          family: 'loot_reveal',
          priority: 'high',
        },
      ]
    }

    case 'SHOP_PURCHASE_COMPLETED':
      return [{ assetKey: 'coin_pickup', family: 'coin' }]

    case 'CITY_BUILDING_UNLOCKED':
    case 'DISTRICT_UNLOCKED':
      return [{ assetKey: 'level_up', family: 'city_unlock', priority: 'high' }]

    case 'POI_VISITED':
      return [{ assetKey: 'xp_tick', family: 'poi_enter' }]

    case 'POI_LEVEL_UP':
      return [{ assetKey: 'xp_chime', family: 'poi_level' }]

    case 'LEXICON_BRICK_PLACED':
      return [{ assetKey: 'xp_tick', family: 'lexicon' }]

    case 'LEXICON_BRICK_CRACKED':
      return [{ assetKey: 'streak_break_wind', family: 'lexicon_crack' }]

    case 'LEXICON_BRICK_REPAIRED':
      return [{ assetKey: 'xp_chime', family: 'lexicon_repair' }]

    case 'MEMORY_WALL_COMPLETED':
    case 'POI_PROJECT_COMPLETED':
      return [{ assetKey: 'mission_daily_all', family: 'city_project', priority: 'high' }]

    case 'CITY_RESOURCE_DELIVERED':
      return [{ assetKey: 'coin_pickup', family: 'city_delivery' }]

    case 'CITY_EVENT_STARTED':
      return [{ assetKey: 'streak_flame', family: 'city_event' }]

    case 'PET_INTERACTION':
      return [{ assetKey: 'xp_tick', family: 'pet' }]

    case 'PET_MEMORY_CREATED':
    case 'PET_NAMED':
      return [{ assetKey: 'xp_chime', family: 'pet', priority: 'high' }]

    case 'FOCUS_SESSION_STARTED':
      return [{ assetKey: 'ui_tab_switch', family: 'focus_enter' }]

    case 'FOCUS_SESSION_COMPLETED':
      return [
        { assetKey: 'study_day_stamp', family: 'focus_complete', priority: 'high' },
        ...(event.rewards.coins > 0
          ? [{ assetKey: 'coin_pickup' as const, family: 'coin', delayMs: 180 }]
          : []),
      ]

    case 'ACHIEVEMENT_UNLOCKED':
      return [{ assetKey: 'mission_daily_all', family: 'achievement', priority: 'high' }]

    case 'TITLE_UNLOCKED':
      return [{ assetKey: 'xp_chime', family: 'title', priority: 'high' }]

    case 'PRESTIGE_ASCENDED':
      return [{ assetKey: 'level_up', family: 'prestige', priority: 'high' }]

    case 'CONTRACT_STARTED':
      return [{ assetKey: 'xp_tick', family: 'contract' }]

    case 'CONTRACT_COMPLETED':
      return [{ assetKey: 'mission_complete', family: 'contract', priority: 'high' }]

    case 'CONTRACT_FAILED':
    case 'PUNISHMENT_WARNING':
    case 'DUEL_LOST':
      return [{ assetKey: 'streak_break_wind', family: 'warning' }]

    case 'SHIELD_EARNED':
      return [{ assetKey: 'coin_pickup', family: 'shield' }]

    case 'SHIELD_USED':
      return [{ assetKey: 'streak_break_wind', family: 'shield_used' }]

    case 'JOURNAL_ENTRY_REVIEWED':
    case 'JOURNAL_LINK_CREATED':
    case 'WORDS_LEARNED':
      return [{ assetKey: 'xp_tick', family: 'learning' }]

    case 'FLASH_SESSION_DONE':
      return [{ assetKey: 'xp_chime', family: 'learning' }]

    case 'DUEL_WON':
      return [{ assetKey: 'mission_complete', family: 'duel', priority: 'high' }]

    case 'COLLECTIBLE_DISCOVERED':
      return [{ assetKey: 'coin_pickup', family: 'collectible', priority: 'high' }]

    default:
      return []
  }
}
