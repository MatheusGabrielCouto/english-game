/**
 * Em dev, força o evento ativo fora da janela natural.
 * Valores: 'christmas_2026' | 'halloween_2026' | 'summer_fair' | 'new_year_2027' | null
 */
export const DEV_FORCE_CITY_EVENT_KEY: string | null = __DEV__ ? 'halloween_2026' : null;

export const FESTIVE_SPIRIT_MILESTONES = [25, 50, 75, 100] as const;

export const SPIRIT_PER_EVENT_MISSION_CLAIM = 12;
export const SPIRIT_PER_EVENT_CONTRACT_COMPLETE = 25;
export const SPIRIT_PER_EVENT_VOCAB_WORD = 1;

export const EVENT_VOCAB_DISPLAY_TARGET = 40;
