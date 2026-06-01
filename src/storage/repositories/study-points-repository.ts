import { eq } from 'drizzle-orm';

import { studyPoints, studyPointsHistory } from '@/storage/database/schema';
import type { StudyPointsBalance, StudyPointsTransaction } from '@/types/study-points';

import { getDb } from '../database/client';

const mapBalance = (row: typeof studyPoints.$inferSelect): StudyPointsBalance => ({
  balance: row.balance,
  lifetimeEarned: row.lifetimeEarned,
  lifetimeSpent: row.lifetimeSpent,
  updatedAt: row.updatedAt,
});

export const getStudyPointsBalance = async (): Promise<StudyPointsBalance | null> => {
  const db = getDb();
  const rows = await db.select().from(studyPoints).where(eq(studyPoints.id, 1)).limit(1);
  return rows[0] ? mapBalance(rows[0]) : null;
};

export const getOrCreateStudyPointsBalance = async (): Promise<StudyPointsBalance> => {
  const existing = await getStudyPointsBalance();
  if (existing) return existing;

  const now = new Date().toISOString();
  const db = getDb();
  await db.insert(studyPoints).values({
    id: 1,
    balance: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    updatedAt: now,
  });

  return { balance: 0, lifetimeEarned: 0, lifetimeSpent: 0, updatedAt: now };
};

export const saveStudyPointsBalance = async (balance: StudyPointsBalance): Promise<void> => {
  const db = getDb();
  await db
    .update(studyPoints)
    .set({
      balance: balance.balance,
      lifetimeEarned: balance.lifetimeEarned,
      lifetimeSpent: balance.lifetimeSpent,
      updatedAt: balance.updatedAt,
    })
    .where(eq(studyPoints.id, 1));
};

export const recordStudyPointsTransaction = async (
  amount: number,
  reason: string,
  source: string,
): Promise<void> => {
  const db = getDb();
  await db.insert(studyPointsHistory).values({
    amount,
    reason,
    source,
    createdAt: new Date().toISOString(),
  });
};

export const getRecentStudyPointsHistory = async (limit = 20): Promise<StudyPointsTransaction[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(studyPointsHistory)
    .orderBy(studyPointsHistory.id)
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    amount: row.amount,
    reason: row.reason,
    source: row.source,
    createdAt: row.createdAt,
  }));
};
