import { eq } from 'drizzle-orm';

import { DEFAULT_PLAYER_TITLE } from '@/features/player/constants';
import type { Player, Stats } from '@/types/player';

import { getDb } from '../database/client';
import { player } from '../database/schema';

export type PlayerRecord = Player & Stats;

const mapRow = (row: typeof player.$inferSelect): PlayerRecord => ({
  name: row.name,
  level: row.level,
  xp: row.xp,
  coins: row.coins,
  title: row.title,
  createdAt: row.createdAt,
  lastStudyDate: row.lastStudyDate,
  currentStreak: row.currentStreak,
  bestStreak: row.bestStreak,
  totalStudyDays: row.totalStudyDays,
  shields: row.shields,
});

export const createDefaultPlayerRecord = (): PlayerRecord => ({
  name: 'Aventureiro',
  level: 1,
  xp: 0,
  coins: 0,
  title: DEFAULT_PLAYER_TITLE,
  createdAt: new Date().toISOString(),
  lastStudyDate: null,
  currentStreak: 0,
  bestStreak: 0,
  totalStudyDays: 0,
  shields: 0,
});

export const getPlayer = async (): Promise<PlayerRecord | null> => {
  const db = getDb();
  const rows = await db.select().from(player).where(eq(player.id, 1)).limit(1);

  return rows[0] ? mapRow(rows[0]) : null;
};

export const savePlayer = async (record: PlayerRecord): Promise<void> => {
  const db = getDb();

  await db
    .insert(player)
    .values({
      id: 1,
      name: record.name,
      level: record.level,
      xp: record.xp,
      coins: record.coins,
      title: record.title,
      createdAt: record.createdAt,
      lastStudyDate: record.lastStudyDate,
      currentStreak: record.currentStreak,
      bestStreak: record.bestStreak,
      totalStudyDays: record.totalStudyDays,
      shields: record.shields,
    })
    .onConflictDoUpdate({
      target: player.id,
      set: {
        name: record.name,
        level: record.level,
        xp: record.xp,
        coins: record.coins,
        title: record.title,
        createdAt: record.createdAt,
        lastStudyDate: record.lastStudyDate,
        currentStreak: record.currentStreak,
        bestStreak: record.bestStreak,
        totalStudyDays: record.totalStudyDays,
        shields: record.shields,
      },
    });
};

export const getOrCreatePlayer = async (): Promise<PlayerRecord> => {
  const existing = await getPlayer();
  if (existing) return existing;

  const playerRecord = createDefaultPlayerRecord();
  await savePlayer(playerRecord);
  return playerRecord;
};
