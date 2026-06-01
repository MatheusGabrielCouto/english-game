import { eq } from 'drizzle-orm';

import type { FocusAnalytics } from '@/types/focus-mode';

import { getDb } from '../database/client';
import { focusAnalytics } from '../database/schema';

const mapRow = (row: typeof focusAnalytics.$inferSelect): FocusAnalytics => ({
  totalSessions: row.totalSessions,
  completedSessions: row.completedSessions,
  abandonedSessions: row.abandonedSessions,
  totalFocusSeconds: row.totalFocusSeconds,
  totalDistractionSeconds: row.totalDistractionSeconds,
  totalXpEarned: row.totalXpEarned,
  totalCoinsEarned: row.totalCoinsEarned,
  totalSpEarned: row.totalSpEarned,
  totalLootBoxes: row.totalLootBoxes,
  lastSessionAt: row.lastSessionAt,
});

export const getOrCreateFocusAnalytics = async (): Promise<FocusAnalytics> => {
  const db = getDb();
  const rows = await db.select().from(focusAnalytics).where(eq(focusAnalytics.id, 1)).limit(1);
  if (rows[0]) return mapRow(rows[0]);

  await db.insert(focusAnalytics).values({ id: 1 });
  return {
    totalSessions: 0,
    completedSessions: 0,
    abandonedSessions: 0,
    totalFocusSeconds: 0,
    totalDistractionSeconds: 0,
    totalXpEarned: 0,
    totalCoinsEarned: 0,
    totalSpEarned: 0,
    totalLootBoxes: 0,
    lastSessionAt: null,
  };
};

export const recordFocusAnalytics = async (patch: Partial<FocusAnalytics>): Promise<FocusAnalytics> => {
  const current = await getOrCreateFocusAnalytics();
  const next: FocusAnalytics = {
    totalSessions: patch.totalSessions ?? current.totalSessions,
    completedSessions: patch.completedSessions ?? current.completedSessions,
    abandonedSessions: patch.abandonedSessions ?? current.abandonedSessions,
    totalFocusSeconds: patch.totalFocusSeconds ?? current.totalFocusSeconds,
    totalDistractionSeconds: patch.totalDistractionSeconds ?? current.totalDistractionSeconds,
    totalXpEarned: patch.totalXpEarned ?? current.totalXpEarned,
    totalCoinsEarned: patch.totalCoinsEarned ?? current.totalCoinsEarned,
    totalSpEarned: patch.totalSpEarned ?? current.totalSpEarned,
    totalLootBoxes: patch.totalLootBoxes ?? current.totalLootBoxes,
    lastSessionAt: patch.lastSessionAt ?? current.lastSessionAt,
  };

  const db = getDb();
  await db
    .update(focusAnalytics)
    .set({
      totalSessions: next.totalSessions,
      completedSessions: next.completedSessions,
      abandonedSessions: next.abandonedSessions,
      totalFocusSeconds: next.totalFocusSeconds,
      totalDistractionSeconds: next.totalDistractionSeconds,
      totalXpEarned: next.totalXpEarned,
      totalCoinsEarned: next.totalCoinsEarned,
      totalSpEarned: next.totalSpEarned,
      totalLootBoxes: next.totalLootBoxes,
      lastSessionAt: next.lastSessionAt,
    })
    .where(eq(focusAnalytics.id, 1));

  return next;
};
