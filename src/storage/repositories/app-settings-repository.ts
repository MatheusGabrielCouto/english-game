import { eq } from 'drizzle-orm';

import {
  LearningDifficulty,
  type LearningDifficultyValue,
} from '@/features/game-design/constants/difficulty';

import { getDb } from '../database/client';
import { appSettings } from '../database/schema';

export type AppSettingsRecord = {
  hasOnboarded: boolean;
  currentWeekStart: string | null;
  difficulty: LearningDifficultyValue;
  avatarFrame: string;
  avatarBadge: string | null;
  weeklyLootGrantedWeek: string | null;
  lootPityCounter: number;
};

const mapRow = (row: typeof appSettings.$inferSelect): AppSettingsRecord => ({
  hasOnboarded: row.hasOnboarded,
  currentWeekStart: row.currentWeekStart ?? null,
  difficulty: isLearningDifficulty(row.difficulty) ? row.difficulty : LearningDifficulty.BALANCED,
  avatarFrame: row.avatarFrame ?? 'default',
  avatarBadge: row.avatarBadge ?? null,
  weeklyLootGrantedWeek: row.weeklyLootGrantedWeek ?? null,
  lootPityCounter: row.lootPityCounter ?? 0,
});

const isLearningDifficulty = (value: string | null | undefined): value is LearningDifficultyValue =>
  value === LearningDifficulty.CASUAL ||
  value === LearningDifficulty.BALANCED ||
  value === LearningDifficulty.SERIOUS ||
  value === LearningDifficulty.HARDCORE;

export const getAppSettings = async (): Promise<AppSettingsRecord> => {
  const db = getDb();
  const rows = await db.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1);

  if (!rows[0]) {
    return {
      hasOnboarded: false,
      currentWeekStart: null,
      difficulty: LearningDifficulty.BALANCED,
      avatarFrame: 'default',
      avatarBadge: null,
      weeklyLootGrantedWeek: null,
      lootPityCounter: 0,
    };
  }

  return mapRow(rows[0]);
};

export const saveAppSettings = async (settings: AppSettingsRecord): Promise<void> => {
  const db = getDb();

  await db
    .insert(appSettings)
    .values({
      id: 1,
      hasOnboarded: settings.hasOnboarded,
      currentWeekStart: settings.currentWeekStart,
      difficulty: settings.difficulty,
      avatarFrame: settings.avatarFrame,
      avatarBadge: settings.avatarBadge,
      weeklyLootGrantedWeek: settings.weeklyLootGrantedWeek,
      lootPityCounter: settings.lootPityCounter,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        hasOnboarded: settings.hasOnboarded,
        currentWeekStart: settings.currentWeekStart,
        difficulty: settings.difficulty,
        avatarFrame: settings.avatarFrame,
        avatarBadge: settings.avatarBadge,
        weeklyLootGrantedWeek: settings.weeklyLootGrantedWeek,
        lootPityCounter: settings.lootPityCounter,
      },
    });
};

export const setCurrentWeekStart = async (weekStartDate: string): Promise<void> => {
  const current = await getAppSettings();
  await saveAppSettings({ ...current, currentWeekStart: weekStartDate });
};

export const getOrCreateAppSettings = async (): Promise<AppSettingsRecord> => {
  const settings = await getAppSettings();
  await saveAppSettings(settings);
  return settings;
};
