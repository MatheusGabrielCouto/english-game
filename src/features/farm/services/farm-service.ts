import {
    DAILY_FARM_COIN_CAP,
    DAILY_FARM_SOFT_CAP,
    FARM_ACTIVITY_BY_KEY,
    FARM_MANUAL_ACTION_COOLDOWN_MS,
    FARM_MISSION_BONUS_MULTIPLIER,
    FARM_POST_MISSION_MULTIPLIER,
} from '@/features/game-design/catalogs/farm-catalog';
import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';
import { PlayerService } from '@/features/player/services/player-service';
import { useMissionsStore } from '@/features/quests/store/missions-store';
import { getTodayKey } from '@/features/quests/utils/date';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { GameEvents } from '@/services/game-events';
import { LEMMA_POOL } from '@/data/loaders/lemma-pool';
import { VOCAB_PACKS_BY_KEY } from '@/data/loaders/vocab-packs';
import {
    getFarmStatsSince,
    getRecentFarmSessions,
    getTodayFarmCoins,
    getTodayFarmStudyPoints,
    recordFarmSession,
} from '@/storage/repositories/farm-repository';
import { FarmActivityType, type FarmActivityTypeValue } from '@/types/farm';

import { useFarmStore } from '../store/farm-store';
import { CityEventScheduler } from '@/features/city/services/city-event-scheduler';

let manualRecordInFlight = false;

const getDayStartIso = (dayKey: string): string => `${dayKey}T00:00:00.000Z`;

const areDailyMissionsComplete = (): boolean => {
  const missions = useMissionsStore.getState().missions;
  if (missions.length === 0) return false;
  return missions.every((mission) => mission.completed);
};

const computeMultiplier = (): number =>
  areDailyMissionsComplete() ? FARM_POST_MISSION_MULTIPLIER : FARM_MISSION_BONUS_MULTIPLIER;

export const getManualFarmCooldownRemainingMs = (): number => {
  const endsAt = useFarmStore.getState().manualCooldownEndsAt;
  if (!endsAt) return 0;
  return Math.max(0, endsAt - Date.now());
};

const startManualCooldown = (): void => {
  useFarmStore.setState({
    manualCooldownEndsAt: Date.now() + FARM_MANUAL_ACTION_COOLDOWN_MS,
  });
};

const refreshStore = async (): Promise<void> => {
  const dayStart = getDayStartIso(getTodayKey());
  const [recentSessions, todayStats, todayStudyPoints] = await Promise.all([
    getRecentFarmSessions(12),
    getFarmStatsSince(dayStart),
    getTodayFarmStudyPoints(dayStart),
  ]);

  useFarmStore.setState({
    recentSessions,
    todayStats,
    todayStudyPoints,
    isLoading: false,
  });
};

const buildVocabularySessionWords = (
  amount: number,
): { term: string; translation: string; sourcePackKey?: string; themeTags?: string[] }[] => {
  const safeAmount = Math.max(0, Math.round(amount));
  if (safeAmount <= 0) return [];

  const activeEvent = CityEventScheduler.getActiveMajorEvent();
  const eventPack = activeEvent ? VOCAB_PACKS_BY_KEY[activeEvent.vocabPackKey] : null;

  if (eventPack && eventPack.words.length > 0) {
    const picks = pickDeterministicSubset(
      eventPack.words,
      Math.min(safeAmount, eventPack.words.length),
      `farm-vocab-pack-${eventPack.packKey}-${Date.now()}`,
    );

    return picks.map((word) => ({
      term: word.term,
      translation: word.translation,
      sourcePackKey: eventPack.packKey,
      themeTags: [`event:${eventPack.packKey}`],
    }));
  }

  const fallback = pickDeterministicSubset(
    LEMMA_POOL,
    Math.min(safeAmount, LEMMA_POOL.length),
    `farm-vocab-lemma-${Date.now()}`,
  );
  return fallback.map((entry) => ({
    term: entry.lemma,
    translation: entry.translation,
    sourcePackKey: 'lemma_pool',
    themeTags: entry.themeTags,
  }));
};

export const FarmService = {
  async initialize(): Promise<void> {
    await refreshStore();
  },

  async recordActivity(
    activityType: FarmActivityTypeValue,
    amount: number,
  ): Promise<{ studyPoints: number; coins: number } | null> {
    if (amount <= 0) return null;

    const definition = FARM_ACTIVITY_BY_KEY[activityType];
    if (!definition) return null;

    const dayStart = getDayStartIso(getTodayKey());
    const [earnedTodaySp, earnedTodayCoins] = await Promise.all([
      getTodayFarmStudyPoints(dayStart),
      getTodayFarmCoins(dayStart),
    ]);

    if (earnedTodaySp >= DAILY_FARM_SOFT_CAP && earnedTodayCoins >= DAILY_FARM_COIN_CAP) {
      return { studyPoints: 0, coins: 0 };
    }

    const multiplier = computeMultiplier();
    let studyPoints = Math.round(definition.studyPointsPerUnit * amount * multiplier);
    let coins = Math.round(definition.coinPerUnit * amount * multiplier);

    const spRemaining = DAILY_FARM_SOFT_CAP - earnedTodaySp;
    studyPoints = Math.min(studyPoints, Math.max(0, spRemaining));

    const coinRemaining = DAILY_FARM_COIN_CAP - earnedTodayCoins;
    coins = Math.min(coins, Math.max(0, coinRemaining));

    if (studyPoints <= 0 && coins <= 0) return null;

    const now = new Date().toISOString();
    await recordFarmSession({
      activityType,
      amount,
      studyPointsEarned: studyPoints,
      coinsEarned: coins,
      recordedAt: now,
    });

    if (studyPoints > 0) {
      await StudyPointsService.earn(
        studyPoints,
        `${definition.name}: +${amount} ${definition.unitLabel}`,
        activityType,
      );
    }

    if (coins > 0) {
      PlayerService.addCoins(coins);
    }

    GameEvents.emit({
      type: 'FARM_ACTIVITY_RECORDED',
      activityType,
      amount,
      studyPointsEarned: studyPoints,
      coinsEarned: coins,
    });

    if (activityType === FarmActivityType.VOCABULARY) {
      GameEvents.emit({
        type: 'WORDS_LEARNED',
        amount,
        words: buildVocabularySessionWords(amount),
      });
    }

    if (activityType === FarmActivityType.SPEAKING) {
      GameEvents.emit({ type: 'SPEAKING_SESSION_COMPLETED', amount });
    }

    await refreshStore();
    return { studyPoints, coins };
  },

  async recordManualActivity(
    activityType: FarmActivityTypeValue,
    amount: number,
  ): Promise<{ studyPoints: number; coins: number } | null> {
    if (manualRecordInFlight || getManualFarmCooldownRemainingMs() > 0) {
      return null;
    }

    manualRecordInFlight = true;
    try {
      const result = await FarmService.recordActivity(activityType, amount);
      if (result) {
        startManualCooldown();
      }
      return result;
    } finally {
      manualRecordInFlight = false;
    }
  },

  refresh: refreshStore,
};
