export type AudioAssetKey =
  | 'ui_tap_soft_a'
  | 'ui_tap_soft_b'
  | 'ui_tab_switch'
  | 'xp_tick'
  | 'xp_chime'
  | 'xp_surge'
  | 'coin_pickup_a'
  | 'coin_pickup_b'
  | 'mission_complete'
  | 'mission_daily_all'
  | 'study_day_stamp'
  | 'streak_flame'
  | 'streak_break_wind'
  | 'level_up'
  | 'loot_shake'
  | 'loot_reveal_common'
  | 'loot_reveal_uncommon'
  | 'loot_reveal_rare'
  | 'loot_reveal_epic'
  | 'loot_reveal_legendary'
  | 'loot_reveal_mythic'
  | 'loot_reveal_ancient'

export type AudioPoolId = 'ui_tap_soft' | 'coin_pickup'

export type AudioSettings = {
  enabled: boolean
  masterVolume: number
  sfxVolume: number
  studySilentMode: boolean
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true,
  masterVolume: 1,
  sfxVolume: 0.85,
  studySilentMode: false,
}
