import { getTodayKey } from '@/features/quests/utils/date';
import { usePlayerStore } from '@/features/player';
import { LearningAppStateRepository } from '@/storage/repositories/learning-app-state-repository';
import type { DuelPatent } from '@/types/duel';

import type { DuelArenaMode } from '../constants/duel-progression-config';
import { DUEL_PROGRESSION_CONFIG } from '../constants/duel-progression-config';
import {
  DUEL_DAILY_COIN_CAP,
  getPatentCoinCapMultiplier,
} from '../constants/duel-balance-config';
import { DuelProfileService } from './duel-profile-service';

export type DuelRewardResult = {
  xp: number;
  coins: number;
  isConsolation: boolean;
};

const STATE_DUEL_COINS_DATE = 'duel_coins_earned_date';
const STATE_DUEL_COINS_AMOUNT = 'duel_coins_earned_amount';

const WIN_XP = 45;
const WIN_COINS = 18;
const LOSS_XP = 12;
const LOSS_COINS = 0;

const readDailyCoinsEarned = async (): Promise<number> => {
  const today = getTodayKey();
  const storedDate = await LearningAppStateRepository.get(STATE_DUEL_COINS_DATE);
  if (storedDate !== today) return 0;
  const raw = await LearningAppStateRepository.get(STATE_DUEL_COINS_AMOUNT);
  return raw ? Number.parseInt(raw, 10) || 0 : 0;
};

const applyDailyCoinCap = async (coins: number, patent: DuelPatent): Promise<number> => {
  if (coins <= 0) return 0;

  const earnedToday = await readDailyCoinsEarned();
  const cap = Math.round(DUEL_DAILY_COIN_CAP * getPatentCoinCapMultiplier(patent));
  const remaining = Math.max(0, cap - earnedToday);
  const granted = Math.min(coins, remaining);

  if (granted > 0) {
    const today = getTodayKey();
    await LearningAppStateRepository.set(STATE_DUEL_COINS_DATE, today);
    await LearningAppStateRepository.set(STATE_DUEL_COINS_AMOUNT, String(earnedToday + granted));
  }

  return granted;
};

export const DuelRewardService = {
  computeRewards(
    won: boolean,
    questionsAnswered: number,
    mode: DuelArenaMode = 'ranked',
  ): DuelRewardResult {
    if (mode === 'rematch_review' || mode === 'patent_exam') {
      return { xp: 0, coins: 0, isConsolation: false };
    }

    const scale = Math.min(1.2, 0.85 + questionsAnswered * 0.03);
    const modeMultiplier =
      mode === 'dojo' || mode === 'card_duel'
        ? DUEL_PROGRESSION_CONFIG.dojoXpMultiplier
        : mode === 'weekly_boss'
          ? 1.15
          : 1;

    if (won) {
      return {
        xp: Math.round(WIN_XP * scale * modeMultiplier),
        coins: Math.round(
          WIN_COINS * scale * (mode === 'dojo' || mode === 'card_duel' ? 0.5 : 1),
        ),
        isConsolation: false,
      };
    }

    return {
      xp: Math.round(LOSS_XP * scale * modeMultiplier),
      coins: LOSS_COINS,
      isConsolation: true,
    };
  },

  async grantRewards(rewards: DuelRewardResult, mode: DuelArenaMode = 'ranked'): Promise<void> {
    if (rewards.xp <= 0 && rewards.coins <= 0) return;

    let coins = rewards.coins;
    if (mode === 'ranked' || mode === 'weekly_boss') {
      const { currentPatent } = await DuelProfileService.reconcileProfile();
      coins = await applyDailyCoinCap(coins, currentPatent);
    }

    usePlayerStore.getState().addMissionRewards(rewards.xp, coins);
  },
};
