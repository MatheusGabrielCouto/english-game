import { eq, isNull } from 'drizzle-orm';

import type {
  ActivePenalty,
  PunishmentHistoryEntry,
  PunishmentSeverityValue,
} from '@/types/punishment';

import { getDb } from '../database/client';
import { punishmentHistory } from '../database/schema';

export const appendPunishmentHistory = async (
  penalty: ActivePenalty,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  const db = getDb();
  await db.insert(punishmentHistory).values({
    triggerType: penalty.trigger,
    severity: penalty.severity,
    xpDecayPercent: penalty.xpDecayPercent,
    coinDecayPercent: penalty.coinDecayPercent,
    lootLuckReduction: penalty.lootLuckReduction,
    contractPenalty: penalty.contractPenalty,
    petMoodOverride: penalty.petMoodOverride,
    cityVibrancy: penalty.cityVibrancy,
    appliedAt: penalty.appliedAt,
    metadataJson: metadata ? JSON.stringify(metadata) : null,
  });
};

export const markActivePenaltiesRecovered = async (recoveredAt: string): Promise<void> => {
  const db = getDb();
  await db
    .update(punishmentHistory)
    .set({ recoveredAt })
    .where(isNull(punishmentHistory.recoveredAt));
};

export const getRecentPunishmentHistory = async (limit = 10): Promise<PunishmentHistoryEntry[]> => {
  const db = getDb();
  const rows = await db.select().from(punishmentHistory).orderBy(punishmentHistory.id).limit(limit);

  return rows
    .slice()
    .reverse()
    .map((row) => ({
      id: row.id,
      trigger: row.triggerType as PunishmentHistoryEntry['trigger'],
      severity: row.severity as PunishmentSeverityValue,
      xpDecayPercent: row.xpDecayPercent,
      coinDecayPercent: row.coinDecayPercent,
      lootLuckReduction: row.lootLuckReduction,
      contractPenalty: row.contractPenalty,
      petMoodOverride: row.petMoodOverride as PunishmentHistoryEntry['petMoodOverride'],
      cityVibrancy: row.cityVibrancy,
      appliedAt: row.appliedAt,
      recoveredAt: row.recoveredAt,
    }));
};
