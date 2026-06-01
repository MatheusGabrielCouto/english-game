import { usePlayerStore } from '@/features/player/store/player-store'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import type { GameEvent } from '@/services/game-events'
import type { LootBoxRarityValue } from '@/types/inventory'
import { LootBoxRarity } from '@/types/inventory'

import type { AudioDirectorApi } from './audio-director'
import type { AudioAssetKey } from './types'

const LOOT_REVEAL_BY_RARITY: Record<LootBoxRarityValue, AudioAssetKey> = {
  [LootBoxRarity.COMMON]: 'loot_reveal_common',
  [LootBoxRarity.UNCOMMON]: 'loot_reveal_uncommon',
  [LootBoxRarity.RARE]: 'loot_reveal_rare',
  [LootBoxRarity.EPIC]: 'loot_reveal_epic',
  [LootBoxRarity.LEGENDARY]: 'loot_reveal_legendary',
  [LootBoxRarity.MYTHIC]: 'loot_reveal_mythic',
  [LootBoxRarity.ANCIENT]: 'loot_reveal_ancient',
}

const pickXpSound = (amount: number): AudioAssetKey => {
  if (amount >= 100) return 'xp_surge'
  if (amount >= 20) return 'xp_chime'
  return 'xp_tick'
}

const areAllDailyMissionsComplete = (): boolean => {
  const missions = useMissionsStore.getState().missions
  return missions.length > 0 && missions.every((mission) => mission.completed)
}

export const handleGameEventAudio = (director: AudioDirectorApi, event: GameEvent): void => {
  switch (event.type) {
    case 'XP_GAINED':
      void director.playSFX(pickXpSound(event.amount), { family: 'xp' })
      break

    case 'PLAYER_LEVEL_UP':
      void director.playSFX('level_up', { family: 'level_up', priority: 'high' })
      break

    case 'DAILY_MISSION_COMPLETED': {
      if (areAllDailyMissionsComplete()) {
        void director.playSFX('mission_daily_all', { family: 'mission', priority: 'high' })
      } else {
        void director.playSFX('mission_complete', { family: 'mission', priority: 'high' })
      }
      if (event.coinReward && event.coinReward > 0) {
        void director.playSFX('coin_pickup', { family: 'coin', delayMs: 120 })
      }
      break
    }

    case 'LOCAL_MISSION_COMPLETED':
      void director.playSFX('mission_complete', { family: 'mission', priority: 'high' })
      if (event.coinReward > 0) {
        void director.playSFX('coin_pickup', { family: 'coin', delayMs: 100 })
      }
      break

    case 'STUDY_DAY_RECORDED': {
      void director.playSFX('study_day_stamp', { family: 'study_day', priority: 'high' })
      const streak = usePlayerStore.getState().currentStreak
      if (streak > 0) {
        void director.playSFX('streak_flame', { family: 'streak', delayMs: 280 })
      }
      break
    }

    case 'STREAK_BROKEN':
      void director.playSFX('streak_break_wind', { family: 'streak_break' })
      break

    case 'LOOT_BOX_OPENED': {
      const rarity = event.result.boxRarity as LootBoxRarityValue
      const revealKey = LOOT_REVEAL_BY_RARITY[rarity] ?? 'loot_reveal_common'
      void director.playSFX(revealKey, { family: 'loot_reveal', priority: 'high' })
      break
    }

    case 'SHOP_PURCHASE_COMPLETED':
      void director.playSFX('coin_pickup', { family: 'coin' })
      break

    default:
      break
  }
}
