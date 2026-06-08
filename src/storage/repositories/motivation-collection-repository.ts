import { asc, eq } from 'drizzle-orm'

import type { MotivationCollectionRecord } from '@/types/motivation-spark'

import { getDb } from '../database/client'
import { motivationCollections } from '../database/schema'

const mapRow = (row: typeof motivationCollections.$inferSelect): MotivationCollectionRecord => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  sortOrder: row.sortOrder,
  createdAt: row.createdAt,
})

export const MotivationCollectionRepository = {
  async list(): Promise<MotivationCollectionRecord[]> {
    const db = getDb()
    const rows = await db
      .select()
      .from(motivationCollections)
      .orderBy(asc(motivationCollections.sortOrder), asc(motivationCollections.name))
    return rows.map(mapRow)
  },

  async findById(id: string): Promise<MotivationCollectionRecord | null> {
    const db = getDb()
    const rows = await db
      .select()
      .from(motivationCollections)
      .where(eq(motivationCollections.id, id))
      .limit(1)
    return rows[0] ? mapRow(rows[0]) : null
  },

  async insert(record: MotivationCollectionRecord): Promise<void> {
    const db = getDb()
    await db.insert(motivationCollections).values({
      id: record.id,
      name: record.name,
      emoji: record.emoji,
      sortOrder: record.sortOrder,
      createdAt: record.createdAt,
    })
  },

  async update(
    id: string,
    patch: Partial<Pick<MotivationCollectionRecord, 'name' | 'emoji' | 'sortOrder'>>,
  ): Promise<void> {
    const db = getDb()
    await db
      .update(motivationCollections)
      .set({
        ...(patch.name != null ? { name: patch.name } : {}),
        ...(patch.emoji != null ? { emoji: patch.emoji } : {}),
        ...(patch.sortOrder != null ? { sortOrder: patch.sortOrder } : {}),
      })
      .where(eq(motivationCollections.id, id))
  },

  async delete(id: string): Promise<void> {
    const db = getDb()
    await db.delete(motivationCollections).where(eq(motivationCollections.id, id))
  },
}
