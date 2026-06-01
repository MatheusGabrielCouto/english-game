import { desc, eq } from 'drizzle-orm';

import type { LegacyMilestoneRecord, MetagameStateRecord } from '@/types/metagame';

import { getDb } from '../database/client';
import { legacyMilestones, metagameState } from '../database/schema';

const parseAnnualProgress = (value: string): Record<string, number> => {
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

const parseClaimedTiers = (value: string | null | undefined): number[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is number => typeof v === 'number');
  } catch {
    return [];
  }
};

const mapMetagame = (row: typeof metagameState.$inferSelect): MetagameStateRecord => ({
  prestigeLevel: row.prestigeLevel,
  seasonKey: row.seasonKey,
  seasonPoints: row.seasonPoints,
  seasonClaimedTiers: parseClaimedTiers(row.seasonClaimedTiersJson),
  annualProgress: parseAnnualProgress(row.annualProgressJson),
  updatedAt: row.updatedAt,
});

export const getMetagameState = async (): Promise<MetagameStateRecord | null> => {
  const db = getDb();
  const rows = await db.select().from(metagameState).where(eq(metagameState.id, 1)).limit(1);
  return rows[0] ? mapMetagame(rows[0]) : null;
};

export const saveMetagameState = async (record: MetagameStateRecord): Promise<void> => {
  const db = getDb();
  await db
    .insert(metagameState)
    .values({
      id: 1,
      prestigeLevel: record.prestigeLevel,
      seasonKey: record.seasonKey,
      seasonPoints: record.seasonPoints,
      seasonClaimedTiersJson: JSON.stringify(record.seasonClaimedTiers),
      annualProgressJson: JSON.stringify(record.annualProgress),
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: metagameState.id,
      set: {
        prestigeLevel: record.prestigeLevel,
        seasonKey: record.seasonKey,
        seasonPoints: record.seasonPoints,
        seasonClaimedTiersJson: JSON.stringify(record.seasonClaimedTiers),
        annualProgressJson: JSON.stringify(record.annualProgress),
        updatedAt: new Date().toISOString(),
      },
    });
};

export const getLegacyMilestones = async (): Promise<LegacyMilestoneRecord[]> => {
  const db = getDb();
  const rows = await db.select().from(legacyMilestones).orderBy(desc(legacyMilestones.occurredAt));
  return rows.map((row) => ({
    milestoneKey: row.milestoneKey,
    category: row.category as LegacyMilestoneRecord['category'],
    title: row.title,
    description: row.description,
    occurredAt: row.occurredAt,
    recordedAt: row.recordedAt,
  }));
};

export const recordLegacyMilestone = async (
  input: Omit<LegacyMilestoneRecord, 'recordedAt'>,
): Promise<boolean> => {
  const db = getDb();
  const existing = await db
    .select()
    .from(legacyMilestones)
    .where(eq(legacyMilestones.milestoneKey, input.milestoneKey))
    .limit(1);

  if (existing[0]) return false;

  await db.insert(legacyMilestones).values({
    milestoneKey: input.milestoneKey,
    category: input.category,
    title: input.title,
    description: input.description,
    occurredAt: input.occurredAt,
    recordedAt: new Date().toISOString(),
  });

  return true;
};
