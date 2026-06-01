import { and, count, desc, eq, gte, lte } from 'drizzle-orm';

import { getDb } from '../database/client';
import { studyDays } from '../database/schema';

export type StudyDayRecord = {
  studyDate: string;
  recordedAt: string;
};

const mapRow = (row: typeof studyDays.$inferSelect): StudyDayRecord => ({
  studyDate: row.studyDate,
  recordedAt: row.recordedAt,
});

export const StudyDaysRepository = {
  async findByDate(studyDate: string): Promise<StudyDayRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(studyDays)
      .where(eq(studyDays.studyDate, studyDate))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(studyDate: string, recordedAt = new Date().toISOString()): Promise<StudyDayRecord> {
    const db = getDb();
    await db.insert(studyDays).values({ studyDate, recordedAt }).onConflictDoNothing();
    return { studyDate, recordedAt };
  },

  async countAll(): Promise<number> {
    const db = getDb();
    const rows = await db.select({ total: count() }).from(studyDays);
    return rows[0]?.total ?? 0;
  },

  async findRecent(limit: number): Promise<StudyDayRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(studyDays)
      .orderBy(desc(studyDays.studyDate))
      .limit(limit);

    return rows.map(mapRow);
  },

  async findBetween(startDate: string, endDate: string): Promise<StudyDayRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(studyDays)
      .where(and(gte(studyDays.studyDate, startDate), lte(studyDays.studyDate, endDate)))
      .orderBy(desc(studyDays.studyDate));

    return rows.map(mapRow);
  },

  async findEarliest(): Promise<StudyDayRecord | null> {
    const db = getDb();
    const rows = await db.select().from(studyDays).orderBy(studyDays.studyDate).limit(1);
    return rows[0] ? mapRow(rows[0]) : null;
  },
};
