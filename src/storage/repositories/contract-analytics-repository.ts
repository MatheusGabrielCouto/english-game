import { eq } from 'drizzle-orm';

import type { ContractAnalyticsRecord } from '@/types/contract';

import { getDb } from '../database/client';
import { contractAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: ContractAnalyticsRecord = {
  totalAccepted: 0,
  totalCompleted: 0,
  totalFailed: 0,
  totalCoinsStaked: 0,
  totalCoinsWon: 0,
  totalCoinsLost: 0,
  totalShieldsGranted: 0,
  totalLootBoxesGranted: 0,
  largestContractCompletedKey: null,
  lastContractAt: null,
};

const mapRow = (row: typeof contractAnalytics.$inferSelect): ContractAnalyticsRecord => ({
  totalAccepted: row.totalAccepted,
  totalCompleted: row.totalCompleted,
  totalFailed: row.totalFailed,
  totalCoinsStaked: row.totalCoinsStaked,
  totalCoinsWon: row.totalCoinsWon,
  totalCoinsLost: row.totalCoinsLost,
  totalShieldsGranted: row.totalShieldsGranted,
  totalLootBoxesGranted: row.totalLootBoxesGranted,
  largestContractCompletedKey: row.largestContractCompletedKey,
  lastContractAt: row.lastContractAt,
});

export const ContractAnalyticsRepository = {
  async getOrCreate(): Promise<ContractAnalyticsRecord> {
    const db = getDb();
    const rows = await db
      .select()
      .from(contractAnalytics)
      .where(eq(contractAnalytics.id, 1))
      .limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(contractAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: ContractAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(contractAnalytics)
      .values({
        id: 1,
        totalAccepted: record.totalAccepted,
        totalCompleted: record.totalCompleted,
        totalFailed: record.totalFailed,
        totalCoinsStaked: record.totalCoinsStaked,
        totalCoinsWon: record.totalCoinsWon,
        totalCoinsLost: record.totalCoinsLost,
        totalShieldsGranted: record.totalShieldsGranted,
        totalLootBoxesGranted: record.totalLootBoxesGranted,
        largestContractCompletedKey: record.largestContractCompletedKey,
        lastContractAt: record.lastContractAt,
      })
      .onConflictDoUpdate({
        target: contractAnalytics.id,
        set: {
          totalAccepted: record.totalAccepted,
          totalCompleted: record.totalCompleted,
          totalFailed: record.totalFailed,
          totalCoinsStaked: record.totalCoinsStaked,
          totalCoinsWon: record.totalCoinsWon,
          totalCoinsLost: record.totalCoinsLost,
          totalShieldsGranted: record.totalShieldsGranted,
          totalLootBoxesGranted: record.totalLootBoxesGranted,
          largestContractCompletedKey: record.largestContractCompletedKey,
          lastContractAt: record.lastContractAt,
        },
      });
  },

  async recordAccepted(params: {
    stakeAmount: number;
    acceptedAt: string;
  }): Promise<ContractAnalyticsRecord> {
    const analytics = await ContractAnalyticsRepository.getOrCreate();
    const next: ContractAnalyticsRecord = {
      ...analytics,
      totalAccepted: analytics.totalAccepted + 1,
      totalCoinsStaked: analytics.totalCoinsStaked + params.stakeAmount,
      lastContractAt: params.acceptedAt,
    };
    await ContractAnalyticsRepository.save(next);
    return next;
  },

  async recordCompleted(params: {
    contractKey: string;
    targetDays: number;
    coinsWon: number;
    shieldsGranted: number;
    lootBoxesGranted: number;
    completedAt: string;
  }): Promise<ContractAnalyticsRecord> {
    const analytics = await ContractAnalyticsRepository.getOrCreate();
    const currentLargest = analytics.largestContractCompletedKey
      ? CONTRACT_DAYS_BY_KEY[analytics.largestContractCompletedKey] ?? 0
      : 0;
    const nextLargest =
      params.targetDays >= currentLargest ? params.contractKey : analytics.largestContractCompletedKey;

    const next: ContractAnalyticsRecord = {
      ...analytics,
      totalCompleted: analytics.totalCompleted + 1,
      totalCoinsWon: analytics.totalCoinsWon + params.coinsWon,
      totalShieldsGranted: analytics.totalShieldsGranted + params.shieldsGranted,
      totalLootBoxesGranted: analytics.totalLootBoxesGranted + params.lootBoxesGranted,
      largestContractCompletedKey: nextLargest,
      lastContractAt: params.completedAt,
    };
    await ContractAnalyticsRepository.save(next);
    return next;
  },

  async recordFailed(params: {
    stakeAmount: number;
    failedAt: string;
  }): Promise<ContractAnalyticsRecord> {
    const analytics = await ContractAnalyticsRepository.getOrCreate();
    const next: ContractAnalyticsRecord = {
      ...analytics,
      totalFailed: analytics.totalFailed + 1,
      totalCoinsLost: analytics.totalCoinsLost + params.stakeAmount,
      lastContractAt: params.failedAt,
    };
    await ContractAnalyticsRepository.save(next);
    return next;
  },
};

const CONTRACT_DAYS_BY_KEY: Record<string, number> = {
  consistency_starter: 3,
  weekly_focus: 7,
  discipline_builder: 14,
  commitment_master: 30,
};
