import { desc, eq, lt } from 'drizzle-orm'

import type { MentorChatMessage, MentorChatSessionRecord } from '@/types/mentor-ai'

import { getDb } from '../database/client'
import { mentorChatSessions } from '../database/schema'

const nowIso = () => new Date().toISOString()

const parseMessages = (json: string): MentorChatMessage[] => {
  try {
    const parsed = JSON.parse(json) as unknown
    return Array.isArray(parsed) ? (parsed as MentorChatMessage[]) : []
  } catch {
    return []
  }
}

const mapRow = (row: typeof mentorChatSessions.$inferSelect): MentorChatSessionRecord => ({
  id: row.id,
  mode: row.mode as MentorChatSessionRecord['mode'],
  title: row.title,
  messages: parseMessages(row.messagesJson),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const MentorChatRepository = {
  async findById(id: string): Promise<MentorChatSessionRecord | null> {
    const db = getDb()
    const rows = await db.select().from(mentorChatSessions).where(eq(mentorChatSessions.id, id)).limit(1)
    return rows[0] ? mapRow(rows[0]) : null
  },

  async listRecent(limit = 20): Promise<MentorChatSessionRecord[]> {
    const db = getDb()
    const rows = await db
      .select()
      .from(mentorChatSessions)
      .orderBy(desc(mentorChatSessions.updatedAt))
      .limit(limit)

    return rows.map(mapRow)
  },

  async create(session: Omit<MentorChatSessionRecord, 'messages'> & { messages?: MentorChatMessage[] }): Promise<void> {
    const db = getDb()
    const messages = session.messages ?? []
    await db.insert(mentorChatSessions).values({
      id: session.id,
      mode: session.mode,
      title: session.title,
      messagesJson: JSON.stringify(messages),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    })
  },

  async updateMessages(id: string, messages: MentorChatMessage[], title?: string): Promise<void> {
    const db = getDb()
    const updatedAt = nowIso()
    await db
      .update(mentorChatSessions)
      .set({
        messagesJson: JSON.stringify(messages),
        updatedAt,
        ...(title ? { title } : {}),
      })
      .where(eq(mentorChatSessions.id, id))
  },

  async deleteOlderThan(cutoffIso: string): Promise<number> {
    const db = getDb()
    const rows = await db
      .select({ id: mentorChatSessions.id })
      .from(mentorChatSessions)
      .where(lt(mentorChatSessions.updatedAt, cutoffIso))

    for (const row of rows) {
      await db.delete(mentorChatSessions).where(eq(mentorChatSessions.id, row.id))
    }

    return rows.length
  },

  async deleteById(id: string): Promise<void> {
    const db = getDb()
    await db.delete(mentorChatSessions).where(eq(mentorChatSessions.id, id))
  },

  async countAll(): Promise<number> {
    const db = getDb()
    const rows = await db.select().from(mentorChatSessions)
    return rows.length
  },

  async deleteAll(): Promise<void> {
    const db = getDb()
    await db.delete(mentorChatSessions)
  },
}
