import { MentorChatRepository } from '@/storage/repositories/mentor-chat-repository'
import { MentorErrorRepository } from '@/storage/repositories/mentor-error-repository'
import { MentorMemoryRepository } from '@/storage/repositories/mentor-memory-repository'
import {
  MentorMemoryKeyPrefix,
  type MentorChatSessionRecord,
  type MentorErrorLogRecord,
} from '@/types/mentor-ai'

import { useMentorChatStore } from '../store/mentor-chat-store'
import { MentorMemoryService } from './mentor-memory-service'

export type MentorMemoryEntryView = {
  key: string
  value: string
  updatedAt: string
  kind: 'goal' | 'preference' | 'topic'
}

export type MentorHistorySnapshot = {
  sessions: MentorChatSessionRecord[]
  errors: MentorErrorLogRecord[]
  memory: {
    goals: MentorMemoryEntryView[]
    preferences: MentorMemoryEntryView[]
    topics: MentorMemoryEntryView[]
  }
  errorCategoryCounts: Record<string, number>
}

const parseMemoryValue = (valueJson: string): string => {
  try {
    const parsed = JSON.parse(valueJson) as unknown
    if (typeof parsed === 'string') return parsed
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string').join(', ')
    }
    return valueJson
  } catch {
    return valueJson
  }
}

const resolveMemoryKind = (key: string): MentorMemoryEntryView['kind'] | null => {
  if (key.startsWith(MentorMemoryKeyPrefix.GOAL)) return 'goal'
  if (key.startsWith(MentorMemoryKeyPrefix.PREFERENCE)) return 'preference'
  if (key.startsWith(MentorMemoryKeyPrefix.TOPIC)) return 'topic'
  return null
}

const mapMemoryEntries = (rows: { key: string; value: string; updatedAt: string }[]) => {
  const goals: MentorMemoryEntryView[] = []
  const preferences: MentorMemoryEntryView[] = []
  const topics: MentorMemoryEntryView[] = []

  for (const row of rows) {
    const kind = resolveMemoryKind(row.key)
    if (!kind) continue

    const entry: MentorMemoryEntryView = {
      key: row.key,
      value: parseMemoryValue(row.value),
      updatedAt: row.updatedAt,
      kind,
    }

    if (kind === 'goal') goals.push(entry)
    if (kind === 'preference') preferences.push(entry)
    if (kind === 'topic') topics.push(entry)
  }

  return { goals, preferences, topics }
}

export const MentorHistoryService = {
  async loadSnapshot(limit = 30): Promise<MentorHistorySnapshot> {
    const [sessions, errors, memoryRows] = await Promise.all([
      MentorChatRepository.listRecent(limit),
      MentorErrorRepository.listRecent(limit),
      MentorMemoryRepository.listAll(),
    ])

    const errorCategoryCounts = errors.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.category] = (acc[entry.category] ?? 0) + 1
      return acc
    }, {})

    return {
      sessions,
      errors,
      memory: mapMemoryEntries(memoryRows),
      errorCategoryCounts,
    }
  },

  async openChatSession(sessionId: string): Promise<boolean> {
    const session = await MentorChatRepository.findById(sessionId)
    if (!session) return false

    useMentorChatStore.setState({
      sessionId: session.id,
      messages: session.messages,
      isGenerating: false,
      streamingText: '',
      hasHydrated: true,
      error: null,
      lastCapturedGoal: null,
    })

    return true
  },

  async deleteChatSession(sessionId: string): Promise<void> {
    await MentorChatRepository.deleteById(sessionId)

    const { sessionId: activeSessionId } = useMentorChatStore.getState()
    if (activeSessionId === sessionId) {
      useMentorChatStore.setState({
        sessionId: null,
        messages: [],
        isGenerating: false,
        streamingText: '',
        hasHydrated: false,
        error: null,
      })
    }
  },

  async deleteError(errorId: string): Promise<void> {
    await MentorErrorRepository.deleteById(errorId)
  },

  async deleteMemoryEntry(key: string): Promise<void> {
    await MentorMemoryRepository.delete(key)
  },

  async addGoal(text: string): Promise<void> {
    await MentorMemoryService.addGoal(text)
  },

  async addPreference(text: string): Promise<void> {
    await MentorMemoryService.addPreference(text)
  },
}
