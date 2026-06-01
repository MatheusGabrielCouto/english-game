import type { AudioAssetKey } from './types'

export const AUDIO_CATALOG: Record<AudioAssetKey, number> = {
  ui_tap_soft_a: require('../../../assets/audio/ui/ui_tap_soft_a.wav'),
  ui_tap_soft_b: require('../../../assets/audio/ui/ui_tap_soft_b.wav'),
  ui_tab_switch: require('../../../assets/audio/ui/ui_tab_switch.wav'),

  xp_tick: require('../../../assets/audio/gameplay/xp_tick.wav'),
  xp_chime: require('../../../assets/audio/gameplay/xp_chime.wav'),
  xp_surge: require('../../../assets/audio/gameplay/xp_surge.wav'),
  coin_pickup_a: require('../../../assets/audio/gameplay/coin_pickup_a.wav'),
  coin_pickup_b: require('../../../assets/audio/gameplay/coin_pickup_b.wav'),
  mission_complete: require('../../../assets/audio/gameplay/mission_complete.wav'),
  mission_daily_all: require('../../../assets/audio/gameplay/mission_daily_all.wav'),
  study_day_stamp: require('../../../assets/audio/gameplay/study_day_stamp.wav'),
  streak_flame: require('../../../assets/audio/gameplay/streak_flame.wav'),
  streak_break_wind: require('../../../assets/audio/gameplay/streak_break_wind.wav'),
  level_up: require('../../../assets/audio/gameplay/level_up.wav'),

  loot_shake: require('../../../assets/audio/loot/loot_shake.wav'),
  loot_reveal_common: require('../../../assets/audio/loot/loot_reveal_common.wav'),
  loot_reveal_uncommon: require('../../../assets/audio/loot/loot_reveal_uncommon.wav'),
  loot_reveal_rare: require('../../../assets/audio/loot/loot_reveal_rare.wav'),
  loot_reveal_epic: require('../../../assets/audio/loot/loot_reveal_epic.wav'),
  loot_reveal_legendary: require('../../../assets/audio/loot/loot_reveal_legendary.wav'),
  loot_reveal_mythic: require('../../../assets/audio/loot/loot_reveal_mythic.wav'),
  loot_reveal_ancient: require('../../../assets/audio/loot/loot_reveal_ancient.wav'),
}

export const AUDIO_POOLS: Record<string, AudioAssetKey[]> = {
  ui_tap_soft: ['ui_tap_soft_a', 'ui_tap_soft_b'],
  coin_pickup: ['coin_pickup_a', 'coin_pickup_b'],
}

const FAMILY_COOLDOWN_MS = 80
const MAX_SIMULTANEOUS_SFX = 5

export const AUDIO_LIMITS = {
  familyCooldownMs: FAMILY_COOLDOWN_MS,
  maxSimultaneousSfx: MAX_SIMULTANEOUS_SFX,
}
