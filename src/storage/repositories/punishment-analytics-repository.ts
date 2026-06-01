import { eq } from 'drizzle-orm';

import type { PunishmentAnalytics } from '@/types/punishment';
import { PunishmentTrigger, type PunishmentTriggerValue } from '@/types/punishment';

import { getDb } from '../database/client';
import { punishmentAnalytics } from '../database/schema';

const defaultAnalytics = (): PunishmentAnalytics => ({
  totalApplied: 0,
  totalRecovered: 0,
  totalWarnings: 0,
  streakFailures: 0,
  contractFailures: 0,
  focusFailures: 0,
  inactivityFailures: 0,
  avgRecoveryDays: 0,
  lastAppliedAt: null,
  lastRecoveredAt: null,
});

export const getOrCreatePunishmentAnalytics = async (): Promise<PunishmentAnalytics> => {
  const db = getDb();
  const rows = await db.select().from(punishmentAnalytics).where(eq(punishmentAnalytics.id, 1)).limit(1);
  if (!rows[0]) {
    await db.insert(punishmentAnalytics).values({ id: 1 });
    return defaultAnalytics();
  }

  const row = rows[0];
  return {
    totalApplied: row.totalApplied,
    totalRecovered: row.totalRecovered,
    totalWarnings: row.totalWarnings,
    streakFailures: row.streakFailures,
    contractFailures: row.contractFailures,
    focusFailures: row.focusFailures,
    inactivityFailures: row.inactivityFailures,
    avgRecoveryDays: row.avgRecoveryDays,
    lastAppliedAt: row.lastAppliedAt,
    lastRecoveredAt: row.lastRecoveredAt,
  };
};

export const recordPunishmentApplied = async (trigger: PunishmentTriggerValue): Promise<void> => {
  const current = await getOrCreatePunishmentAnalytics();
  const now = new Date().toISOString();

  await getDb()
    .update(punishmentAnalytics)
    .set({
      totalApplied: current.totalApplied + 1,
      totalWarnings: current.totalWarnings + 1,
      streakFailures:
        trigger === PunishmentTrigger.STREAK_BROKEN
          ? current.streakFailures + 1
          : current.streakFailures,
      contractFailures:
        trigger === PunishmentTrigger.CONTRACT_FAILED
          ? current.contractFailures + 1
          : current.contractFailures,
      focusFailures:
        trigger === PunishmentTrigger.FOCUS_DISTRACTION ||
        trigger === PunishmentTrigger.FOCUS_ABANDONED
          ? current.focusFailures + 1
          : current.focusFailures,
      inactivityFailures:
        trigger === PunishmentTrigger.INACTIVITY
          ? current.inactivityFailures + 1
          : current.inactivityFailures,
      lastAppliedAt: now,
    })
    .where(eq(punishmentAnalytics.id, 1));
};

export const recordPunishmentRecovered = async (recoveryDays: number): Promise<void> => {
  const current = await getOrCreatePunishmentAnalytics();
  const now = new Date().toISOString();
  const nextAvg =
    current.totalRecovered === 0
      ? recoveryDays
      : (current.avgRecoveryDays * current.totalRecovered + recoveryDays) / (current.totalRecovered + 1);

  await getDb()
    .update(punishmentAnalytics)
    .set({
      totalRecovered: current.totalRecovered + 1,
      avgRecoveryDays: nextAvg,
      lastRecoveredAt: now,
    })
    .where(eq(punishmentAnalytics.id, 1));
};
