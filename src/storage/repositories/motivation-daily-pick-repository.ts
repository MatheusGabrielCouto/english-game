import { desc, eq } from 'drizzle-orm'

import type { MotivationDailyPickRecord } from '@/types/motivation-spark'

import { getDb } from '../database/client'
import { motivationDailyPicks } from '../database/schema'

const mapRow = (row: typeof motivationDailyPicks.$inferSelect): MotivationDailyPickRecord => ({
  dateKey: row.dateKey,
  sparkId: row.sparkId,
  notifiedAt: row.notifiedAt,
  eveningNotifiedAt: row.eveningNotifiedAt ?? null,
  openedAt: row.openedAt,
})

export const MotivationDailyPickRepository = {
  async findByDateKey(dateKey: string): Promise<MotivationDailyPickRecord | null> {
    const db = getDb()
    const rows = await db
      .select()
      .from(motivationDailyPicks)
      .where(eq(motivationDailyPicks.dateKey, dateKey))
      .limit(1)
    return rows[0] ? mapRow(rows[0]) : null
  },

  async listRecent(limit = 30): Promise<MotivationDailyPickRecord[]> {
    const db = getDb()
    const rows = await db
      .select()
      .from(motivationDailyPicks)
      .orderBy(desc(motivationDailyPicks.dateKey))
      .limit(limit)
    return rows.map(mapRow)
  },

  async upsert(pick: MotivationDailyPickRecord): Promise<void> {
    const db = getDb()
    await db
      .insert(motivationDailyPicks)
      .values({
        dateKey: pick.dateKey,
        sparkId: pick.sparkId,
        notifiedAt: pick.notifiedAt,
        eveningNotifiedAt: pick.eveningNotifiedAt,
        openedAt: pick.openedAt,
      })
      .onConflictDoUpdate({
        target: motivationDailyPicks.dateKey,
        set: {
          sparkId: pick.sparkId,
          notifiedAt: pick.notifiedAt,
          eveningNotifiedAt: pick.eveningNotifiedAt,
          openedAt: pick.openedAt,
        },
      })
  },

  async markOpened(dateKey: string, openedAt: string): Promise<void> {
    const db = getDb()
    await db
      .update(motivationDailyPicks)
      .set({ openedAt })
      .where(eq(motivationDailyPicks.dateKey, dateKey))
  },
}
