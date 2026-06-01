import { and, asc, desc, eq } from 'drizzle-orm';

import type {
  DuelPlayerProfileRecord,
  DuelSessionQuestionRecord,
  DuelSessionRecord,
  DuelSessionStatus,
} from '@/types/duel';
import { DUEL_PROFILE_ROW_ID } from '@/types/duel';
import type { McqPrompt } from '@/types/mcq-question';

import { getDb } from '../database/client';
import { duelPlayerProfile, duelSessionQuestions, duelSessions } from '../database/schema';

const parsePrompt = (json: string): McqPrompt => JSON.parse(json) as McqPrompt;

const mapProfileRow = (row: typeof duelPlayerProfile.$inferSelect): DuelPlayerProfileRecord => ({
  id: row.id,
  currentPatent: row.currentPatent as DuelPlayerProfileRecord['currentPatent'],
  patentXp: row.patentXp,
  highestPatent: row.highestPatent as DuelPlayerProfileRecord['highestPatent'],
  stamina: row.stamina,
  staminaUpdatedAt: row.staminaUpdatedAt,
  focusCharges: row.focusCharges,
  dailyDuelCount: row.dailyDuelCount,
  dailyResetDate: row.dailyResetDate,
});

const mapSessionRow = (row: typeof duelSessions.$inferSelect): DuelSessionRecord => ({
  id: row.id,
  enemyKey: row.enemyKey,
  arenaKey: row.arenaKey,
  patentAtStart: row.patentAtStart as DuelSessionRecord['patentAtStart'],
  playerHp: row.playerHp,
  enemyHp: row.enemyHp,
  comboStreak: row.comboStreak,
  status: row.status as DuelSessionStatus,
  startedAt: row.startedAt,
  endedAt: row.endedAt,
});

const mapQuestionRow = (row: typeof duelSessionQuestions.$inferSelect): DuelSessionQuestionRecord => ({
  id: row.id,
  sessionId: row.sessionId,
  sortOrder: row.sortOrder,
  questionType: row.questionType,
  lemma: row.lemma,
  prompt: parsePrompt(row.promptJson),
  answeredIndex: row.answeredIndex,
  isCorrect: row.isCorrect,
  responseMs: row.responseMs,
  damageDealt: row.damageDealt,
});

export const DuelRepository = {
  async updateProfile(profile: DuelPlayerProfileRecord): Promise<void> {
    const db = getDb();
    await db
      .update(duelPlayerProfile)
      .set({
        currentPatent: profile.currentPatent,
        patentXp: profile.patentXp,
        highestPatent: profile.highestPatent,
        stamina: profile.stamina,
        staminaUpdatedAt: profile.staminaUpdatedAt,
        focusCharges: profile.focusCharges,
        dailyDuelCount: profile.dailyDuelCount,
        dailyResetDate: profile.dailyResetDate,
      })
      .where(eq(duelPlayerProfile.id, DUEL_PROFILE_ROW_ID));
  },

  async getProfile(): Promise<DuelPlayerProfileRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(duelPlayerProfile)
      .where(eq(duelPlayerProfile.id, DUEL_PROFILE_ROW_ID))
      .limit(1);

    return rows[0] ? mapProfileRow(rows[0]) : null;
  },

  async insertSession(session: DuelSessionRecord): Promise<void> {
    const db = getDb();
    await db.insert(duelSessions).values({
      id: session.id,
      enemyKey: session.enemyKey,
      arenaKey: session.arenaKey,
      patentAtStart: session.patentAtStart,
      playerHp: session.playerHp,
      enemyHp: session.enemyHp,
      comboStreak: session.comboStreak,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    });
  },

  async updateSession(
    sessionId: string,
    patch: Partial<
      Pick<DuelSessionRecord, 'playerHp' | 'enemyHp' | 'comboStreak' | 'status' | 'endedAt'>
    >,
  ): Promise<void> {
    const db = getDb();
    await db.update(duelSessions).set(patch).where(eq(duelSessions.id, sessionId));
  },

  async getSession(sessionId: string): Promise<DuelSessionRecord | null> {
    const db = getDb();
    const rows = await db.select().from(duelSessions).where(eq(duelSessions.id, sessionId)).limit(1);
    return rows[0] ? mapSessionRow(rows[0]) : null;
  },

  async insertSessionQuestion(question: DuelSessionQuestionRecord): Promise<void> {
    const db = getDb();
    await db.insert(duelSessionQuestions).values({
      id: question.id,
      sessionId: question.sessionId,
      sortOrder: question.sortOrder,
      questionType: question.questionType,
      lemma: question.lemma,
      promptJson: JSON.stringify(question.prompt),
      answeredIndex: question.answeredIndex,
      isCorrect: question.isCorrect,
      responseMs: question.responseMs,
      damageDealt: question.damageDealt,
    });
  },

  async updateSessionQuestion(
    questionId: string,
    patch: Pick<
      DuelSessionQuestionRecord,
      'answeredIndex' | 'isCorrect' | 'responseMs' | 'damageDealt'
    >,
  ): Promise<void> {
    const db = getDb();
    await db.update(duelSessionQuestions).set(patch).where(eq(duelSessionQuestions.id, questionId));
  },

  async getLastLostSession(): Promise<DuelSessionRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(duelSessions)
      .where(eq(duelSessions.status, 'lost'))
      .orderBy(desc(duelSessions.endedAt))
      .limit(1);

    return rows[0] ? mapSessionRow(rows[0]) : null;
  },

  async listSessionQuestions(sessionId: string): Promise<DuelSessionQuestionRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(duelSessionQuestions)
      .where(eq(duelSessionQuestions.sessionId, sessionId))
      .orderBy(asc(duelSessionQuestions.sortOrder));

    return rows.map(mapQuestionRow);
  },
};
