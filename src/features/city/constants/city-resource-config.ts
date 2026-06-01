import { CityResourceType, type CityResourceTypeValue } from '@/types/city-resource';

export const CITY_RESOURCE_LABELS: Record<
  CityResourceTypeValue,
  { label: string; emoji: string; shortLabel: string }
> = {
  [CityResourceType.LEXICON_BRICK]: {
    label: 'Tijolos Lexicon',
    emoji: '🧱',
    shortLabel: 'Tijolos',
  },
  [CityResourceType.FLUENCY_CEMENT]: {
    label: 'Cimento de fluência',
    emoji: '🏗️',
    shortLabel: 'Cimento',
  },
  [CityResourceType.CONSISTENCY_WOOD]: {
    label: 'Madeira de consistência',
    emoji: '🪵',
    shortLabel: 'Madeira',
  },
};

/** Palavras aprendidas (farm) → tijolos */
export const BRICKS_PER_WORD_LEARNED = 1;

/** Sessões de speaking → cimento */
export const CEMENT_PER_SPEAKING_SESSION = 1;

/** Dias de estudo → madeira */
export const WOOD_PER_STUDY_DAY = 2;

/** Máximo entregue por tipo de recurso por dia (anti-farm) */
export const DAILY_DELIVERY_CAP: Record<CityResourceTypeValue, number> = {
  [CityResourceType.LEXICON_BRICK]: 80,
  [CityResourceType.FLUENCY_CEMENT]: 40,
  [CityResourceType.CONSISTENCY_WOOD]: 50,
};

export const DELIVERY_POI_KEYS = ['central_library', 'town_hall'] as const;
