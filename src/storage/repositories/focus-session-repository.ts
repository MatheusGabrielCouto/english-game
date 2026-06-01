import { desc, eq } from 'drizzle-orm';

import {
  FocusSessionStatus,
  type FocusSession,
  type FocusSessionEvent,
  type FocusSessionEventTypeValue,
  type FocusSessionStatusValue,
  type FocusStudyTypeValue,
} from '@/types/focus-mode';

import { getDb } from '../database/client';
import { focusSessionEvents, focusSessions } from '../database/schema';

const mapSession = (row: typeof focusSessions.$inferSelect): FocusSession => ({
  id: row.id,
  studyType: row.studyType as FocusStudyTypeValue,
  plannedDurationSec: row.plannedDurationSec,
  status: row.status as FocusSessionStatusValue,
  startedAt: row.startedAt,
  endedAt: row.endedAt,
  focusedSeconds: row.focusedSeconds,
  distractedSeconds: row.distractedSeconds,
  idleSeconds: row.idleSeconds,
  pauseSeconds: row.pauseSeconds,
  wordsLearned: row.wordsLearned,
  xpEarned: row.xpEarned,
  coinsEarned: row.coinsEarned,
  spEarned: row.spEarned,
  bonusMultiplier: row.bonusMultiplier,
  lootBoxGranted: row.lootBoxGranted,
  lootBoxRarity: row.lootBoxRarity,
  abandonReason: row.abandonReason,
});

const mapEvent = (row: typeof focusSessionEvents.$inferSelect): FocusSessionEvent => ({
  id: row.id,
  sessionId: row.sessionId,
  eventType: row.eventType as FocusSessionEvent['eventType'],
  packageName: row.packageName,
  durationSec: row.durationSec,
  occurredAt: row.occurredAt,
  metadataJson: row.metadataJson,
});

export const createFocusSession = async (input: {
  studyType: FocusStudyTypeValue;
  plannedDurationSec: number;
}): Promise<FocusSession> => {
  const db = getDb();
  const startedAt = new Date().toISOString();
  const rows = await db
    .insert(focusSessions)
    .values({
      studyType: input.studyType,
      plannedDurationSec: input.plannedDurationSec,
      status: FocusSessionStatus.ACTIVE,
      startedAt,
    })
    .returning();

  return mapSession(rows[0]);
};

export const getActiveFocusSession = async (): Promise<FocusSession | null> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.status, FocusSessionStatus.ACTIVE))
    .orderBy(desc(focusSessions.startedAt))
    .limit(1);

  return rows[0] ? mapSession(rows[0]) : null;
};

export const getFocusSessionById = async (id: number): Promise<FocusSession | null> => {
  const db = getDb();
  const rows = await db.select().from(focusSessions).where(eq(focusSessions.id, id)).limit(1);
  return rows[0] ? mapSession(rows[0]) : null;
};

export const updateFocusSession = async (
  id: number,
  patch: Partial<
    Pick<
      FocusSession,
      | 'status'
      | 'endedAt'
      | 'focusedSeconds'
      | 'distractedSeconds'
      | 'idleSeconds'
      | 'pauseSeconds'
      | 'wordsLearned'
      | 'xpEarned'
      | 'coinsEarned'
      | 'spEarned'
      | 'bonusMultiplier'
      | 'lootBoxGranted'
      | 'lootBoxRarity'
      | 'abandonReason'
    >
  >,
): Promise<FocusSession | null> => {
  const db = getDb();
  const rows = await db.update(focusSessions).set(patch).where(eq(focusSessions.id, id)).returning();
  return rows[0] ? mapSession(rows[0]) : null;
};

export const appendFocusSessionEvent = async (input: {
  sessionId: number;
  eventType: FocusSessionEventTypeValue;
  packageName?: string | null;
  durationSec?: number | null;
  metadataJson?: string | null;
}): Promise<void> => {
  const db = getDb();
  await db.insert(focusSessionEvents).values({
    sessionId: input.sessionId,
    eventType: input.eventType,
    packageName: input.packageName ?? null,
    durationSec: input.durationSec ?? null,
    occurredAt: new Date().toISOString(),
    metadataJson: input.metadataJson ?? null,
  });
};

export const getRecentFocusSessions = async (limit = 10): Promise<FocusSession[]> => {
  const db = getDb();
  const rows = await db.select().from(focusSessions).orderBy(desc(focusSessions.startedAt)).limit(limit);
  return rows.map(mapSession);
};

export const getFocusSessionEvents = async (sessionId: number): Promise<FocusSessionEvent[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(focusSessionEvents)
    .where(eq(focusSessionEvents.sessionId, sessionId))
    .orderBy(desc(focusSessionEvents.occurredAt));
  return rows.map(mapEvent);
};
