import { and, desc, eq, like, lt } from 'drizzle-orm'

import { MentorMemoryKeyPrefix } from '@/types/mentor-ai'

import { getDb } from '../database/client'
import { mentorMemory } from '../database/schema'

const nowIso = () => new Date().toISOString()

const parseStringArray = (valueJson: string): string[] => {
  try {
    const parsed = JSON.parse(valueJson) as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string')
    }
    if (typeof parsed === 'string') return [parsed]
    return []
  } catch {
    return []
  }
}

export const MentorMemoryRepository = {
  async get(key: string): Promise<string | null> {
    const db = getDb()
    const rows = await db.select().from(mentorMemory).where(eq(mentorMemory.key, key)).limit(1)
    if (!rows[0]) return null
    return rows[0].valueJson
  },

  async set(key: string, value: unknown): Promise<void> {
    const db = getDb()
    const valueJson = JSON.stringify(value)
    const updatedAt = nowIso()

    await db
      .insert(mentorMemory)
      .values({ key, valueJson, updatedAt })
      .onConflictDoUpdate({
        target: mentorMemory.key,
        set: { valueJson, updatedAt },
      })
  },

  async deleteTopicsOlderThan(cutoffIso: string): Promise<number> {
    const db = getDb()
    const rows = await db
      .select({ key: mentorMemory.key })
      .from(mentorMemory)
      .where(
        and(
          like(mentorMemory.key, `${MentorMemoryKeyPrefix.TOPIC}%`),
          lt(mentorMemory.updatedAt, cutoffIso),
        ),
      )

    for (const row of rows) {
      await db.delete(mentorMemory).where(eq(mentorMemory.key, row.key))
    }

    return rows.length
  },

  async delete(key: string): Promise<void> {
    const db = getDb()
    await db.delete(mentorMemory).where(eq(mentorMemory.key, key))
  },

  async listAll(): Promise<{ key: string; value: string; updatedAt: string }[]> {
    const db = getDb()
    const rows = await db.select().from(mentorMemory).orderBy(desc(mentorMemory.updatedAt))
    return rows.map((row) => ({
      key: row.key,
      value: row.valueJson,
      updatedAt: row.updatedAt,
    }))
  },

  async listByPrefix(prefix: string): Promise<{ key: string; value: string }[]> {
    const db = getDb()
    const rows = await db.select().from(mentorMemory).where(like(mentorMemory.key, `${prefix}%`))
    return rows.map((row) => ({ key: row.key, value: row.valueJson }))
  },

  async listStringValuesByPrefix(
    prefix: (typeof MentorMemoryKeyPrefix)[keyof typeof MentorMemoryKeyPrefix],
  ): Promise<string[]> {
    const entries = await MentorMemoryRepository.listByPrefix(prefix)
    return entries.flatMap((entry) => parseStringArray(entry.value))
  },

  async countAll(): Promise<number> {
    const db = getDb()
    const rows = await db.select().from(mentorMemory)
    return rows.length
  },

  async countUserEntries(): Promise<number> {
    const db = getDb()
    const rows = await db.select().from(mentorMemory)
    return rows.filter((row) => !row.key.startsWith('settings_')).length
  },

  async deleteAll(): Promise<void> {
    const db = getDb()
    await db.delete(mentorMemory)
  },
}
