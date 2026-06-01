import { usePlayerStore } from '@/features/player/store/player-store';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents } from '@/services/game-events';
import type { PlayerRecord } from '@/storage/repositories/player-repository';
import { getPlayer, savePlayer } from '@/storage/repositories/player-repository';
import { ShieldMilestonesRepository } from '@/storage/repositories/shield-milestones-repository';
import { ShieldStatsRepository } from '@/storage/repositories/shield-stats-repository';
import { ShieldUsageRepository } from '@/storage/repositories/shield-usage-repository';
import type { ShieldGrantSource, ShieldStatsRecord } from '@/types/shield';

import { getMilestoneForStreak, SHIELD_MESSAGES } from '../constants';
import { applyShieldProtection, getMissedStudyDates } from '../utils/shield';

export type ShieldFeedback = {
  type: 'used' | 'earned' | 'saved' | 'none_left';
  message: string;
  amount?: number;
};

let lastFeedback: ShieldFeedback | null = null;

const syncPlayerShields = (shields: number, currentStreak?: number, lastStudyDate?: string | null) => {
  usePlayerStore.setState({
    shields,
    ...(currentStreak !== undefined ? { currentStreak } : {}),
    ...(lastStudyDate !== undefined ? { lastStudyDate } : {}),
  });
};

export const ShieldService = {
  getLastFeedback(): ShieldFeedback | null {
    return lastFeedback;
  },

  clearFeedback(): void {
    lastFeedback = null;
  },

  async grantShields(amount: number, _source: ShieldGrantSource): Promise<number> {
    if (amount <= 0) return 0;

    const player = await getPlayer();
    if (!player) return 0;

    const shields = player.shields + amount;
    await savePlayer({ ...player, shields });

    const stats = await ShieldStatsRepository.getOrCreate();
    await ShieldStatsRepository.save({
      ...stats,
      totalEarned: stats.totalEarned + amount,
    });

    syncPlayerShields(shields);
    lastFeedback = { type: 'earned', message: SHIELD_MESSAGES.earned, amount };
    GameEvents.emit({ type: 'SHIELD_EARNED', amount });
    return shields;
  },

  async processStreakProtection(player: PlayerRecord, today = getTodayKey()): Promise<PlayerRecord> {
    const missedDates = getMissedStudyDates(player.lastStudyDate, today);
    if (missedDates.length === 0) return player;

    const result = applyShieldProtection(player, missedDates);
    if (result.shieldsConsumed === 0 && !result.streakBroken) return player;

    let nextPlayer = { ...player };

    if (result.shieldsConsumed > 0) {
      const stats = await ShieldStatsRepository.getOrCreate();
      let updatedStats: ShieldStatsRecord = {
        ...stats,
        totalConsumed: stats.totalConsumed + result.shieldsConsumed,
        totalStreaksProtected: stats.totalStreaksProtected + result.shieldsConsumed,
        longestProtectedStreak: Math.max(
          stats.longestProtectedStreak,
          player.currentStreak,
        ),
      };

      let remainingShields = player.shields;

      for (const missedDate of missedDates.slice(0, result.shieldsConsumed)) {
        remainingShields -= 1;
        await ShieldUsageRepository.create({
          usedAt: new Date().toISOString(),
          missedDate,
          streakProtected: player.currentStreak,
          shieldsRemaining: remainingShields,
        });
      }

      await ShieldStatsRepository.save(updatedStats);

      nextPlayer = {
        ...nextPlayer,
        shields: result.shields,
        currentStreak: result.currentStreak,
        lastStudyDate: result.lastStudyDate,
      };

      lastFeedback = {
        type: result.shieldsConsumed > 1 ? 'saved' : 'used',
        message: result.shieldsConsumed > 1 ? SHIELD_MESSAGES.saved : SHIELD_MESSAGES.used,
      };
      GameEvents.emit({ type: 'SHIELD_USED', count: result.shieldsConsumed });
    }

    if (result.streakBroken) {
      nextPlayer = {
        ...nextPlayer,
        currentStreak: 0,
        shields: result.shields,
      };
      lastFeedback = { type: 'none_left', message: SHIELD_MESSAGES.noneLeft };
      GameEvents.emit({ type: 'STREAK_BROKEN' });
    }

    await savePlayer(nextPlayer);
    syncPlayerShields(nextPlayer.shields, nextPlayer.currentStreak, nextPlayer.lastStudyDate);
    return nextPlayer;
  },

  async checkMilestoneRewards(currentStreak: number): Promise<number> {
    const milestone = getMilestoneForStreak(currentStreak);
    if (!milestone) return 0;

    const alreadyClaimed = await ShieldMilestonesRepository.isClaimed(milestone.key);
    if (alreadyClaimed) return 0;

    await ShieldMilestonesRepository.markClaimed(milestone.key);
    return ShieldService.grantShields(milestone.shieldsAwarded, 'milestone');
  },

  async getUsageHistory(limit = 10) {
    return ShieldUsageRepository.findRecent(limit);
  },

  async getStats(): Promise<ShieldStatsRecord> {
    return ShieldStatsRepository.getOrCreate();
  },
};
