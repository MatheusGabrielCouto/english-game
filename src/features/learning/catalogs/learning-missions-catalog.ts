import { MissionCategory, MissionDifficultyTier } from '@/features/game-design/constants/mission-types';
import type { DailyMissionTemplate, WeeklyMissionTemplate } from '@/data/types';
import { WeeklyMissionType } from '@/types/weekly-mission-type';

/** Daily templates auto-completed via LearningMissionBridge (templateKey = id). */
export const LEARNING_DAILY_MISSION_CATALOG: DailyMissionTemplate[] = [
  {
    id: 'learning_daily_duel_win',
    category: MissionCategory.VOCABULARY,
    title: 'Vencedor da arena',
    description: 'Vença um duelo ranqueado ou no dojo.',
    difficulty: MissionDifficultyTier.MEDIUM,
    baseXp: 55,
    baseCoins: 22,
  },
  {
    id: 'learning_daily_flash_review_5',
    category: MissionCategory.REVISION,
    title: 'Cartas na mesa',
    description: 'Revise pelo menos 5 cartas no Baralho Vivo.',
    difficulty: MissionDifficultyTier.EASY,
    baseXp: 40,
    baseCoins: 15,
  },
  {
    id: 'learning_daily_duel_flawless',
    category: MissionCategory.GRAMMAR,
    title: 'Duelo impecável',
    description: 'Vença um duelo sem errar nenhuma pergunta.',
    difficulty: MissionDifficultyTier.HARD,
    baseXp: 75,
    baseCoins: 30,
  },
];

export const LEARNING_WEEKLY_MISSION_CATALOG: WeeklyMissionTemplate[] = [
  {
    id: 'learning_weekly_duel_wins',
    category: MissionCategory.VOCABULARY,
    title: 'Gladiador da semana',
    description: 'Vença 3 duelos esta semana.',
    missionType: WeeklyMissionType.DUEL_WINS,
    targetValue: 3,
    difficulty: MissionDifficultyTier.MEDIUM,
    baseXp: 120,
    baseCoins: 45,
  },
  {
    id: 'learning_weekly_flash_reviews',
    category: MissionCategory.REVISION,
    title: 'Mesa cheia',
    description: 'Revise 25 cartas no Baralho esta semana.',
    missionType: WeeklyMissionType.FLASH_REVIEWS,
    targetValue: 25,
    difficulty: MissionDifficultyTier.MEDIUM,
    baseXp: 100,
    baseCoins: 40,
  },
];
