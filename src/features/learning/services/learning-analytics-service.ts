import { GameEvents, type GameEvent } from '@/services/game-events';
import { AppLogService } from '@/services/app-log-service';
import { LearningAnalyticsRepository } from '@/storage/repositories/learning-analytics-repository';
import type { LearningAnalyticsSnapshot } from '@/types/learning-analytics';

let listenersInitialized = false;
let cached: LearningAnalyticsSnapshot | null = null;

const toSnapshot = (record: Awaited<ReturnType<typeof LearningAnalyticsRepository.getOrCreate>>): LearningAnalyticsSnapshot => {
  const totalDuels = record.duelWins + record.duelLosses;
  const duelWinRate = totalDuels > 0 ? Math.round((record.duelWins / totalDuels) * 100) : 0;
  const cardsSavedFromDuelRate =
    record.duelLosses + record.duelWins > 0
      ? Math.round((record.cardsSavedFromDuel / (record.duelWins + record.duelLosses)) * 100)
      : 0;
  const avgFlashReviewsPerSession =
    record.flashSessions > 0 ? Math.round((record.flashReviews / record.flashSessions) * 10) / 10 : 0;

  return {
    ...record,
    duelWinRate,
    cardsSavedFromDuelRate,
    avgFlashReviewsPerSession,
  };
};

const refreshCache = async (): Promise<LearningAnalyticsSnapshot> => {
  const record = await LearningAnalyticsRepository.getOrCreate();
  cached = toSnapshot(record);
  return cached;
};

const logMetric = (event: string, metadata: Record<string, unknown>): void => {
  AppLogService.info(`learning.${event}`, 'Learning metric', metadata);
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  switch (event.type) {
    case 'DUEL_WON':
      await LearningAnalyticsRepository.increment({
        duelWins: 1,
        duelSessions: 1,
        duelFlawlessWins: event.flawless ? 1 : 0,
      });
      logMetric('duel_won', { mode: event.mode, flawless: event.flawless });
      break;
    case 'DUEL_LOST':
      await LearningAnalyticsRepository.increment({ duelLosses: 1, duelSessions: 1 });
      logMetric('duel_lost', { mode: event.mode });
      break;
    case 'FLASH_SESSION_DONE':
      if (event.cardsReviewed > 0) {
        await LearningAnalyticsRepository.increment({
          flashSessions: 1,
          flashReviews: event.cardsReviewed,
        });
        logMetric('flash_session', { cardsReviewed: event.cardsReviewed });
      }
      break;
    default:
      break;
  }
  await refreshCache();
};

export const LearningAnalyticsService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  async getSnapshot(): Promise<LearningAnalyticsSnapshot> {
    if (cached) return cached;
    return refreshCache();
  },

  async recordCardSavedFromDuel(): Promise<void> {
    await LearningAnalyticsRepository.increment({ cardsSavedFromDuel: 1 });
    logMetric('card_saved_from_duel', {});
    await refreshCache();
  },

  async recordWeeklyBossWin(): Promise<void> {
    await LearningAnalyticsRepository.increment({ weeklyBossWins: 1 });
    logMetric('weekly_boss_won', {});
    await refreshCache();
  },

  async refresh(): Promise<LearningAnalyticsSnapshot> {
    return refreshCache();
  },
};
