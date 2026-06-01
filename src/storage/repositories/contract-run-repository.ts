import { desc, eq } from 'drizzle-orm';

import type { ContractRunRecord } from '@/types/contract';
import { ContractStatus } from '@/types/contract';

import { getDb } from '../database/client';
import { contractRuns } from '../database/schema';

const mapRow = (row: typeof contractRuns.$inferSelect): ContractRunRecord => ({
  id: row.id,
  contractKey: row.contractKey,
  issuerPoiKey: row.issuerPoiKey ?? null,
  status: row.status as ContractRunRecord['status'],
  targetDays: row.targetDays,
  progressDays: row.progressDays,
  stakeAmount: row.stakeAmount,
  startedAt: row.startedAt,
  endedAt: row.endedAt,
  lastProgressAt: row.lastProgressAt,
});

export const ContractRunRepository = {
  async findActive(): Promise<ContractRunRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(contractRuns)
      .where(eq(contractRuns.status, ContractStatus.ACTIVE))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findRecent(limit = 20): Promise<ContractRunRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(contractRuns)
      .orderBy(desc(contractRuns.startedAt))
      .limit(limit);

    return rows.map(mapRow);
  },

  async create(params: {
    contractKey: string;
    issuerPoiKey: string;
    targetDays: number;
    stakeAmount: number;
    startedAt: string;
  }): Promise<ContractRunRecord> {
    const db = getDb();

    const inserted = await db
      .insert(contractRuns)
      .values({
        contractKey: params.contractKey,
        issuerPoiKey: params.issuerPoiKey,
        status: ContractStatus.ACTIVE,
        targetDays: params.targetDays,
        progressDays: 0,
        stakeAmount: params.stakeAmount,
        startedAt: params.startedAt,
        endedAt: null,
        lastProgressAt: null,
      })
      .returning();

    return mapRow(inserted[0]);
  },

  async updateProgress(params: {
    id: number;
    progressDays: number;
    lastProgressAt: string;
  }): Promise<void> {
    const db = getDb();
    await db
      .update(contractRuns)
      .set({
        progressDays: params.progressDays,
        lastProgressAt: params.lastProgressAt,
      })
      .where(eq(contractRuns.id, params.id));
  },

  async complete(params: { id: number; endedAt: string; progressDays: number }): Promise<void> {
    const db = getDb();
    await db
      .update(contractRuns)
      .set({
        status: ContractStatus.COMPLETED,
        progressDays: params.progressDays,
        endedAt: params.endedAt,
      })
      .where(eq(contractRuns.id, params.id));
  },

  async fail(params: { id: number; endedAt: string }): Promise<void> {
    const db = getDb();
    await db
      .update(contractRuns)
      .set({
        status: ContractStatus.FAILED,
        endedAt: params.endedAt,
      })
      .where(eq(contractRuns.id, params.id));
  },
};
