import { FarmActivityType, type FarmActivityDefinition, type FarmActivityTypeValue } from '@/types/farm';

/**
 * Farm SP/coins — calibrado para ~3–5 toques rápidos (+10) ≈ 1 loot box comum (120 SP).
 * Speaking e vocabulário pagam mais (esforço / impacto na cidade).
 */
export const FARM_ACTIVITIES: FarmActivityDefinition[] = [
  {
    key: FarmActivityType.VOCABULARY,
    name: 'Vocabulário',
    emoji: '📝',
    description: 'Aprenda palavras novas e ganhe Study Points.',
    unitLabel: 'palavras',
    studyPointsPerUnit: 3,
    coinPerUnit: 1.5,
  },
  {
    key: FarmActivityType.READING,
    name: 'Leitura',
    emoji: '📖',
    description: 'Leia artigos e textos em inglês.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 5,
    coinPerUnit: 2.5,
  },
  {
    key: FarmActivityType.LISTENING,
    name: 'Escuta',
    emoji: '🎧',
    description: 'Ouça podcasts, aulas e conteúdo em inglês.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 5,
    coinPerUnit: 2.5,
  },
  {
    key: FarmActivityType.SPEAKING,
    name: 'Conversação',
    emoji: '🗣️',
    description: 'Pratique pronúncia e conversação.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 8,
    coinPerUnit: 4,
  },
  {
    key: FarmActivityType.PROGRAMMING,
    name: 'Programação técnica',
    emoji: '💻',
    description: 'Leia documentação técnica em inglês.',
    unitLabel: 'minutos',
    studyPointsPerUnit: 5,
    coinPerUnit: 3,
  },
  {
    key: FarmActivityType.EXERCISE,
    name: 'Exercícios',
    emoji: '✅',
    description: 'Complete exercícios corretamente.',
    unitLabel: 'exercícios',
    studyPointsPerUnit: 3,
    coinPerUnit: 2,
  },
  {
    key: FarmActivityType.REVIEW,
    name: 'Revisão',
    emoji: '🔄',
    description: 'Revise conteúdo já aprendido.',
    unitLabel: 'revisões',
    studyPointsPerUnit: 2,
    coinPerUnit: 1,
  },
];

export const FARM_ACTIVITY_BY_KEY = Object.fromEntries(
  FARM_ACTIVITIES.map((activity) => [activity.key, activity]),
) as Record<FarmActivityTypeValue, FarmActivityDefinition>;

/** Baseline antes de fechar todas as dailies. */
export const FARM_BASE_MULTIPLIER = 1;

/** Bônus após completar as missões diárias (loop infinito pós-quest). */
export const FARM_POST_MISSION_MULTIPLIER = 1.35;

/** @deprecated Use FARM_BASE_MULTIPLIER */
export const FARM_MISSION_BONUS_MULTIPLIER = FARM_BASE_MULTIPLIER;

export const DAILY_FARM_SOFT_CAP = 800;

/** Max coins from farm per calendar day. */
export const DAILY_FARM_COIN_CAP = 350;

/** Minimum wait between manual farm taps on the Farm screen (anti-spam). */
export const FARM_MANUAL_ACTION_COOLDOWN_MS = 3_000;
