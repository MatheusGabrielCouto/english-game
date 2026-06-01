import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultPlayerRecord } from '@/storage/repositories/player-repository';

import {
    getAppSettings,
    saveAppSettings,
} from './repositories/app-settings-repository';
import {
    getMissionsByDate,
    replaceMissionsForDate,
} from './repositories/missions-repository';
import { getPlayer, savePlayer } from './repositories/player-repository';

const LEGACY_KEYS = {
  app: 'english-quest-app-store',
  player: 'english-quest-player-store',
  missions: 'english-quest-missions-store',
} as const;

type PersistedPayload<T> = {
  state: T;
  version?: number;
};

const readLegacyState = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PersistedPayload<T> | T;
    if (parsed && typeof parsed === 'object' && 'state' in parsed) {
      return (parsed as PersistedPayload<T>).state;
    }
    return parsed as T;
  } catch {
    return null;
  }
};

const clearLegacyKeys = async () => {
  await AsyncStorage.multiRemove(Object.values(LEGACY_KEYS));
};

export const migrateFromAsyncStorageIfNeeded = async (): Promise<void> => {
  const alreadyMigrated = await AsyncStorage.getItem('english-quest-sqlite-migrated');
  if (alreadyMigrated === '1') return;

  const hasLegacyData = await AsyncStorage.getItem(LEGACY_KEYS.player);
  if (!hasLegacyData) {
    await AsyncStorage.setItem('english-quest-sqlite-migrated', '1');
    return;
  }

  const legacyPlayer = await readLegacyState<{
    name?: string;
    displayName?: string;
    level?: number;
    xp?: number;
    coins?: number;
    title?: string;
    createdAt?: string;
    lastStudyDate?: string | null;
    currentStreak?: number;
    bestStreak?: number;
  }>(LEGACY_KEYS.player);

  if (legacyPlayer && !(await getPlayer())) {
    const defaults = createDefaultPlayerRecord();
    await savePlayer({
      ...defaults,
      name: legacyPlayer.name ?? legacyPlayer.displayName ?? defaults.name,
      level: legacyPlayer.level ?? defaults.level,
      xp: legacyPlayer.xp ?? defaults.xp,
      coins: legacyPlayer.coins ?? defaults.coins,
      title: legacyPlayer.title ?? defaults.title,
      createdAt: legacyPlayer.createdAt ?? defaults.createdAt,
      lastStudyDate: legacyPlayer.lastStudyDate ?? defaults.lastStudyDate,
      currentStreak: legacyPlayer.currentStreak ?? defaults.currentStreak,
      bestStreak: legacyPlayer.bestStreak ?? defaults.bestStreak,
      totalStudyDays: defaults.totalStudyDays,
      shields: defaults.shields,
    });
  }

  const legacyApp = await readLegacyState<{ hasOnboarded?: boolean }>(LEGACY_KEYS.app);
  if (legacyApp) {
    const current = await getAppSettings();
    await saveAppSettings({
      ...current,
      hasOnboarded: legacyApp.hasOnboarded ?? current.hasOnboarded,
    });
  }

  const legacyMissions = await readLegacyState<{
    missions?: Array<{
      id: string;
      title: string;
      description: string;
      xpReward: number;
      coinReward: number;
      completed: boolean;
    }>;
    missionsDate?: string;
  }>(LEGACY_KEYS.missions);

  if (legacyMissions?.missionsDate && legacyMissions.missions?.length) {
    const existing = await getMissionsByDate(legacyMissions.missionsDate);
    if (existing.length === 0) {
      await replaceMissionsForDate(legacyMissions.missionsDate, legacyMissions.missions);
    }
  }

  await clearLegacyKeys();
  await AsyncStorage.setItem('english-quest-sqlite-migrated', '1');
};
