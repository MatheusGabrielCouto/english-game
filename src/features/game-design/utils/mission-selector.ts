import type { Mission } from '@/types/mission';

import type { LearningDifficultyValue } from '../constants/difficulty';
import { getDifficultyConfig } from '../constants/difficulty';
import { DAILY_MISSION_CATALOG, type DailyMissionTemplate } from '../catalogs/daily-mission-catalog';
import { pickDeterministicSubset } from './reward-scaling';
import { scaleCoins, scaleReward } from './reward-scaling';

export const selectDailyMissions = (
  dateKey: string,
  learningDifficulty: LearningDifficultyValue,
): Mission[] => {
  const config = getDifficultyConfig(learningDifficulty);
  const pool = pickDeterministicSubset(
    DAILY_MISSION_CATALOG,
    config.dailyMissionCount,
    `daily-${dateKey}-${learningDifficulty}`,
  );

  return pool.map((template) => templateToMission(template, learningDifficulty));
};

export const templateToMission = (
  template: DailyMissionTemplate,
  learningDifficulty: LearningDifficultyValue,
): Mission => ({
  id: template.id,
  title: template.title,
  description: template.description,
  xpReward: scaleReward(template.baseXp, template.difficulty, learningDifficulty),
  coinReward: scaleCoins(template.baseCoins, template.difficulty, learningDifficulty),
  completed: false,
  category: template.category,
  difficulty: template.difficulty,
  templateKey: template.id,
});

export const getDailyCatalogSize = (): number => DAILY_MISSION_CATALOG.length;
