import { FarmActivityType, type FarmActivityDefinition, type FarmActivityTypeValue } from '@/types/farm';

export const FARM_ACTIVITIES: FarmActivityDefinition[] = [
  {
    key: FarmActivityType.VOCABULARY,
    name: 'Vocabulary Farm',
    emoji: '📝',
    description: 'Aprenda palavras novas e ganhe Study Points.',
    unitLabel: 'palavras',
    studyPointsPerUnit: 1,
    coinPerUnit: 0.5,
  },
  {
    key: FarmActivityType.READING,
    name: 'Reading Farm',
    emoji: '📖',
    description: 'Leia artigos e textos em inglês.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 2,
    coinPerUnit: 1,
  },
  {
    key: FarmActivityType.LISTENING,
    name: 'Listening Farm',
    emoji: '🎧',
    description: 'Ouça podcasts, aulas e conteúdo em inglês.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 2,
    coinPerUnit: 1,
  },
  {
    key: FarmActivityType.SPEAKING,
    name: 'Speaking Farm',
    emoji: '🗣️',
    description: 'Pratique pronúncia e conversação.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 3,
    coinPerUnit: 1.5,
  },
  {
    key: FarmActivityType.PROGRAMMING,
    name: 'Programming English Farm',
    emoji: '💻',
    description: 'Leia documentação técnica em inglês.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 2,
    coinPerUnit: 1.2,
  },
  {
    key: FarmActivityType.EXERCISE,
    name: 'Exercise Farm',
    emoji: '✅',
    description: 'Complete exercícios corretamente.',
    unitLabel: 'exercícios',
    studyPointsPerUnit: 1,
    coinPerUnit: 0.8,
  },
  {
    key: FarmActivityType.REVIEW,
    name: 'Review Farm',
    emoji: '🔄',
    description: 'Revise conteúdo já aprendido.',
    unitLabel: 'revisões',
    studyPointsPerUnit: 1,
    coinPerUnit: 0.4,
  },
];

export const FARM_ACTIVITY_BY_KEY = Object.fromEntries(
  FARM_ACTIVITIES.map((activity) => [activity.key, activity]),
) as Record<FarmActivityTypeValue, FarmActivityDefinition>;

/** Multiplier when daily missions are done — no penalty (was 0.75). */
export const FARM_POST_MISSION_MULTIPLIER = 1;

/** Bonus when daily missions are incomplete — finish quests first. */
export const FARM_MISSION_BONUS_MULTIPLIER = 1.25;

export const DAILY_FARM_SOFT_CAP = 500;

/** Max coins from farm per calendar day. */
export const DAILY_FARM_COIN_CAP = 200;

/** Minimum wait between manual farm taps on the Farm screen (anti-spam). */
export const FARM_MANUAL_ACTION_COOLDOWN_MS = 3_000;
