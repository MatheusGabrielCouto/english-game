import { usePlayerStore } from '@/features/player/store/player-store';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import { TitleAnalyticsRepository } from '@/storage/repositories/title-analytics-repository';
import { TitleUnlockRepository } from '@/storage/repositories/title-unlock-repository';
import type {
    TitleAnalyticsRecord,
    TitleDefinition,
    TitleSummary,
    TitleUnlockPayload,
    TitleViewModel
} from '@/types/title';

import { TITLE_DEFINITIONS } from '../constants/default-titles';
import { useTitlesStore } from '../store/titles-store';
import { buildTitleProgress, getEligibleTitles, resolveTitleForLevel, sortTitlesByLevel } from '../utils/progress';

let listenersInitialized = false;
let unlockedKeys = new Set<string>();
let unlockDates = new Map<string, string>();
let cachedAnalytics: TitleAnalyticsRecord | null = null;
const celebrationQueue: TitleUnlockPayload[] = [];

const syncPlayerTitle = (titleName: string) => {
  usePlayerStore.getState().setTitle(titleName);
};

const enqueueCelebration = (payload: TitleUnlockPayload) => {
  celebrationQueue.push(payload);
  const current = useTitlesStore.getState().celebration;

  if (!current) {
    useTitlesStore.setState({ celebration: payload });
  }
};

export const dequeueTitleCelebration = (): void => {
  celebrationQueue.shift();
  useTitlesStore.setState({ celebration: celebrationQueue[0] ?? null });
};

const buildViewModels = (activeTitleKey: string): TitleViewModel[] =>
  TITLE_DEFINITIONS.map((title) => ({
    ...title,
    unlockedAt: unlockDates.get(title.key) ?? null,
    isActive: title.key === activeTitleKey,
  }));

const buildSummary = (activeTitleKey: string): TitleSummary => ({
  unlocked: unlockedKeys.size,
  total: TITLE_DEFINITIONS.length,
  currentTitleKey: activeTitleKey,
});

const refreshStore = async (level: number): Promise<void> => {
  const activeTitle = resolveTitleForLevel(level);
  const titles = buildViewModels(activeTitle.key);
  const summary = buildSummary(activeTitle.key);
  const progress = buildTitleProgress(level);

  useTitlesStore.setState({
    titles,
    summary,
    progress,
    analytics: cachedAnalytics,
    isLoading: false,
  });
};

const unlockTitle = async (
  title: TitleDefinition,
  level: number,
  options: { celebrate: boolean },
): Promise<void> => {
  if (unlockedKeys.has(title.key)) return;

  const unlockedAt = new Date().toISOString();

  await TitleUnlockRepository.create({
    titleKey: title.key,
    unlockedAt,
    levelAtUnlock: level,
  });

  unlockedKeys.add(title.key);
  unlockDates.set(title.key, unlockedAt);

  cachedAnalytics = await TitleAnalyticsRepository.recordPromotion(
    title.key,
    unlockedKeys.size,
    unlockedAt,
  );

  GameEvents.emit({
    type: 'TITLE_UNLOCKED',
    titleKey: title.key,
    titleName: title.name,
    levelAtUnlock: level,
  });

  const payload: TitleUnlockPayload = {
    title,
    unlockedAt,
    levelAtUnlock: level,
  };

  if (options.celebrate) {
    enqueueCelebration(payload);
  }
};

const applyActiveTitle = async (level: number): Promise<void> => {
  const activeTitle = resolveTitleForLevel(level);
  syncPlayerTitle(activeTitle.name);

  if (cachedAnalytics && cachedAnalytics.currentTitleKey !== activeTitle.key) {
    cachedAnalytics = {
      ...cachedAnalytics,
      currentTitleKey: activeTitle.key,
    };
    await TitleAnalyticsRepository.save(cachedAnalytics);
  }
};

const checkTitlesForLevel = async (level: number, celebrate: boolean): Promise<void> => {
  const eligible = sortTitlesByLevel(getEligibleTitles(level));
  const pending = eligible.filter((title) => !unlockedKeys.has(title.key));

  for (const title of pending) {
    await unlockTitle(title, level, { celebrate });
  }

  await applyActiveTitle(level);
  await refreshStore(level);
};

export const TitleService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      void TitleService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    if (event.type !== 'PLAYER_LEVEL_UP') return;

    await checkTitlesForLevel(event.level, true);
  },

  async initialize(): Promise<void> {
    const unlocks = await TitleUnlockRepository.findAll();
    unlockedKeys = new Set(unlocks.map((unlock) => unlock.titleKey));
    unlockDates = new Map(unlocks.map((unlock) => [unlock.titleKey, unlock.unlockedAt]));
    cachedAnalytics = await TitleAnalyticsRepository.getOrCreate();

    const player = await getOrCreatePlayer();
    await checkTitlesForLevel(player.level, false);
  },

  async refresh(): Promise<void> {
    const player = await getOrCreatePlayer();
    await refreshStore(player.level);
  },

  getCachedAnalytics(): TitleAnalyticsRecord | null {
    return cachedAnalytics;
  },

  /** Preparado para integração futura com conquistas. */
  async grantTitleByKey(titleKey: string, celebrate = false): Promise<boolean> {
    const title = TITLE_DEFINITIONS.find((entry) => entry.key === titleKey);
    if (!title || unlockedKeys.has(titleKey)) return false;

    const player = await getOrCreatePlayer();
    if (player.level < title.requiredLevel) return false;

    await unlockTitle(title, player.level, { celebrate });
    await applyActiveTitle(player.level);
    await refreshStore(player.level);
    return true;
  },

  dequeueCelebration: dequeueTitleCelebration,
};
