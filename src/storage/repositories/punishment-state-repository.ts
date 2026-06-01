import { eq } from 'drizzle-orm';

import type { ActivePenalty, PunishmentState, PunishmentWarning } from '@/types/punishment';

import { getDb } from '../database/client';
import { punishmentState } from '../database/schema';

const parsePenalties = (json: string): ActivePenalty[] => {
  try {
    const parsed = JSON.parse(json) as ActivePenalty[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseWarning = (json: string | null): PunishmentWarning | null => {
  if (!json) return null;
  try {
    return JSON.parse(json) as PunishmentWarning;
  } catch {
    return null;
  }
};

const defaultState = (): PunishmentState => ({
  activePenalties: [],
  recoveryStreakDays: 0,
  lastAppOpenAt: null,
  lastRecoveryAt: null,
  pendingWarning: null,
  cityVibrancy: 100,
  updatedAt: new Date().toISOString(),
});

export const getOrCreatePunishmentState = async (): Promise<PunishmentState> => {
  const db = getDb();
  const rows = await db.select().from(punishmentState).where(eq(punishmentState.id, 1)).limit(1);

  if (!rows[0]) {
    const now = new Date().toISOString();
    await db.insert(punishmentState).values({
      id: 1,
      activePenaltiesJson: '[]',
      recoveryStreakDays: 0,
      cityVibrancy: 100,
      updatedAt: now,
    });
    return { ...defaultState(), updatedAt: now };
  }

  const row = rows[0];
  return {
    activePenalties: parsePenalties(row.activePenaltiesJson),
    recoveryStreakDays: row.recoveryStreakDays,
    lastAppOpenAt: row.lastAppOpenAt,
    lastRecoveryAt: row.lastRecoveryAt,
    pendingWarning: parseWarning(row.pendingWarningJson),
    cityVibrancy: row.cityVibrancy,
    updatedAt: row.updatedAt,
  };
};

export const savePunishmentState = async (state: PunishmentState): Promise<void> => {
  const db = getDb();
  await db
    .update(punishmentState)
    .set({
      activePenaltiesJson: JSON.stringify(state.activePenalties),
      recoveryStreakDays: state.recoveryStreakDays,
      lastAppOpenAt: state.lastAppOpenAt,
      lastRecoveryAt: state.lastRecoveryAt,
      pendingWarningJson: state.pendingWarning ? JSON.stringify(state.pendingWarning) : null,
      cityVibrancy: state.cityVibrancy,
      updatedAt: state.updatedAt,
    })
    .where(eq(punishmentState.id, 1));
};
