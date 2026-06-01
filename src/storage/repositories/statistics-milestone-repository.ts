import { desc, eq } from 'drizzle-orm';

import type {
    StatisticsMilestoneCategoryValue,
    StatisticsMilestoneRecord,
} from '@/types/statistics';

import { getDb } from '../database/client';
import { statisticsMilestones } from '../database/schema';

const mapRow = (row: typeof statisticsMilestones.$inferSelect): StatisticsMilestoneRecord => ({
  id: row.id,
  category: row.category as StatisticsMilestoneCategoryValue,
  milestoneKey: row.milestoneKey,
  label: row.label,
  value: row.value,
  metadataJson: row.metadataJson,
  occurredAt: row.occurredAt,
});

export const StatisticsMilestoneRepository = {
  async findRecent(limit = 30): Promise<StatisticsMilestoneRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(statisticsMilestones)
      .orderBy(desc(statisticsMilestones.occurredAt))
      .limit(limit);

    return rows.map(mapRow);
  },

  async findByKey(milestoneKey: string): Promise<StatisticsMilestoneRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(statisticsMilestones)
      .where(eq(statisticsMilestones.milestoneKey, milestoneKey))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(params: {
    category: StatisticsMilestoneCategoryValue;
    milestoneKey: string;
    label: string;
    value?: number | null;
    metadataJson?: string | null;
    occurredAt: string;
  }): Promise<StatisticsMilestoneRecord | null> {
    const existing = await this.findByKey(params.milestoneKey);
    if (existing) return existing;

    const db = getDb();

    const inserted = await db
      .insert(statisticsMilestones)
      .values({
        category: params.category,
        milestoneKey: params.milestoneKey,
        label: params.label,
        value: params.value ?? null,
        metadataJson: params.metadataJson ?? null,
        occurredAt: params.occurredAt,
      })
      .returning();

    return inserted[0] ? mapRow(inserted[0]) : null;
  },

  async countAll(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(statisticsMilestones);
    return rows.length;
  },
};
