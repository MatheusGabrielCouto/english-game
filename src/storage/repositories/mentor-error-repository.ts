import { desc, eq, lt } from 'drizzle-orm'

import type { MentorErrorLogRecord } from '@/types/mentor-ai'

import { getDb } from '../database/client'
import { mentorErrorLog } from '../database/schema'

const mapRow = (row: typeof mentorErrorLog.$inferSelect): MentorErrorLogRecord => ({
  id: row.id,
  category: row.category,
  original: row.original,
  corrected: row.corrected,
  occurredAt: row.occurredAt,
})

export const MentorErrorRepository = {
  async insert(entry: MentorErrorLogRecord): Promise<void> {
    const db = getDb()
    await db.insert(mentorErrorLog).values({
      id: entry.id,
      category: entry.category,
      original: entry.original,
      corrected: entry.corrected,
      occurredAt: entry.occurredAt,
    })
  },

  async deleteOlderThan(cutoffIso: string): Promise<number> {
    const db = getDb()
    const rows = await db
      .select({ id: mentorErrorLog.id })
      .from(mentorErrorLog)
      .where(lt(mentorErrorLog.occurredAt, cutoffIso))

    for (const row of rows) {
      await db.delete(mentorErrorLog).where(eq(mentorErrorLog.id, row.id))
    }

    return rows.length
  },

  async deleteById(id: string): Promise<void> {
    const db = getDb()
    await db.delete(mentorErrorLog).where(eq(mentorErrorLog.id, id))
  },

  async countAll(): Promise<number> {
    const db = getDb()
    const rows = await db.select().from(mentorErrorLog)
    return rows.length
  },

  async deleteAll(): Promise<void> {
    const db = getDb()
    await db.delete(mentorErrorLog)
  },

  async listRecent(limit = 20): Promise<MentorErrorLogRecord[]> {
    const db = getDb()
    const rows = await db
      .select()
      .from(mentorErrorLog)
      .orderBy(desc(mentorErrorLog.occurredAt))
      .limit(limit)

    return rows.map(mapRow)
  },
}
