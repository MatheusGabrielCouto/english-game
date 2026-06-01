import { desc, eq } from 'drizzle-orm';

import type { CareerEventRecord, CareerProgressRecord } from '@/types/career';

import { getDb } from '../database/client';
import { careerEvents, careerProgress } from '../database/schema';

const parseJsonArray = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const parseJsonObject = (value: string): Record<string, number> => {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => typeof v === 'number'),
    ) as Record<string, number>;
  } catch {
    return {};
  }
};

const mapProgress = (row: typeof careerProgress.$inferSelect): CareerProgressRecord => ({
  currentRoleKey: row.currentRoleKey as CareerProgressRecord['currentRoleKey'],
  currentCompanyKey: row.currentCompanyKey as CareerProgressRecord['currentCompanyKey'],
  englishScore: row.englishScore,
  completedInterviews: parseJsonArray(row.completedInterviewsJson),
  unlockedOffers: parseJsonArray(row.unlockedOffersJson),
  dreamProgress: parseJsonObject(row.dreamProgressJson),
  promotionsCount: row.promotionsCount,
  updatedAt: row.updatedAt,
});

export const getCareerProgress = async (): Promise<CareerProgressRecord | null> => {
  const db = getDb();
  const rows = await db.select().from(careerProgress).where(eq(careerProgress.id, 1)).limit(1);
  return rows[0] ? mapProgress(rows[0]) : null;
};

export const saveCareerProgress = async (record: CareerProgressRecord): Promise<void> => {
  const db = getDb();
  await db
    .insert(careerProgress)
    .values({
      id: 1,
      currentRoleKey: record.currentRoleKey,
      currentCompanyKey: record.currentCompanyKey,
      englishScore: record.englishScore,
      completedInterviewsJson: JSON.stringify(record.completedInterviews),
      unlockedOffersJson: JSON.stringify(record.unlockedOffers),
      dreamProgressJson: JSON.stringify(record.dreamProgress),
      promotionsCount: record.promotionsCount,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: careerProgress.id,
      set: {
        currentRoleKey: record.currentRoleKey,
        currentCompanyKey: record.currentCompanyKey,
        englishScore: record.englishScore,
        completedInterviewsJson: JSON.stringify(record.completedInterviews),
        unlockedOffersJson: JSON.stringify(record.unlockedOffers),
        dreamProgressJson: JSON.stringify(record.dreamProgress),
        promotionsCount: record.promotionsCount,
        updatedAt: new Date().toISOString(),
      },
    });
};

export const addCareerEvent = async (input: Omit<CareerEventRecord, 'id'>): Promise<void> => {
  const db = getDb();
  await db.insert(careerEvents).values({
    eventType: input.eventType,
    eventKey: input.eventKey,
    title: input.title,
    description: input.description,
    occurredAt: input.occurredAt,
  });
};

export const getRecentCareerEvents = async (limit = 20): Promise<CareerEventRecord[]> => {
  const db = getDb();
  const rows = await db.select().from(careerEvents).orderBy(desc(careerEvents.occurredAt)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    eventType: row.eventType as CareerEventRecord['eventType'],
    eventKey: row.eventKey,
    title: row.title,
    description: row.description,
    occurredAt: row.occurredAt,
  }));
};
