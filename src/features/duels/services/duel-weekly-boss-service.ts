import { getWeekBounds } from '@/features/weekly-quests/utils/week';
import { LearningAppStateRepository } from '@/storage/repositories/learning-app-state-repository';

import { DUEL_WEEKLY_BOSS_COIN_BONUS } from '../constants/duel-balance-config';

const STATE_WEEKLY_BOSS = 'weekly_boss_defeated_week';

export type WeeklyBossStatus = {
  weekKey: string;
  defeatedThisWeek: boolean;
  coinBonus: number;
  enemyKey: string;
};

export const WEEKLY_BOSS_ENEMY_KEY = 'weekly_lexicon_guardian';

export const DuelWeeklyBossService = {
  async getStatus(): Promise<WeeklyBossStatus> {
    const { weekStartDate } = getWeekBounds();
    const defeatedOn = await LearningAppStateRepository.get(STATE_WEEKLY_BOSS);

    return {
      weekKey: weekStartDate,
      defeatedThisWeek: defeatedOn === weekStartDate,
      coinBonus: DUEL_WEEKLY_BOSS_COIN_BONUS,
      enemyKey: WEEKLY_BOSS_ENEMY_KEY,
    };
  },

  async markDefeated(): Promise<void> {
    const { weekStartDate } = getWeekBounds();
    await LearningAppStateRepository.set(STATE_WEEKLY_BOSS, weekStartDate);
  },
};
