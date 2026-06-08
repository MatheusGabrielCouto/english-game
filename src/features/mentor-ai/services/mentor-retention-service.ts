import { MentorChatRepository } from '@/storage/repositories/mentor-chat-repository'
import { MentorErrorRepository } from '@/storage/repositories/mentor-error-repository'
import { MentorMemoryRepository } from '@/storage/repositories/mentor-memory-repository'

import {
  MENTOR_RETENTION_DAYS_DEFAULT,
  MENTOR_RETENTION_DAY_OPTIONS,
  MENTOR_RETENTION_PRUNE_INTERVAL_MS,
  MentorRetentionMemoryKey,
  type MentorRetentionDaysOption,
} from '../constants/mentor-retention'
import { buildRetentionCutoffIso } from '../utils/build-retention-cutoff'
import { useMentorChatStore } from '../store/mentor-chat-store'

export { buildRetentionCutoffIso } from '../utils/build-retention-cutoff'

export type MentorRetentionConfig = {
  enabled: boolean
  retentionDays: MentorRetentionDaysOption
}

export type MentorRetentionPruneResult = {
  ran: boolean
  chatSessions: number
  errorLogs: number
  topics: number
  cutoffIso: string | null
}

const nowIso = () => new Date().toISOString()

const parseBoolean = (value: string | null, fallback: boolean): boolean => {
  if (value === null) return fallback
  try {
    const parsed = JSON.parse(value) as unknown
    return typeof parsed === 'boolean' ? parsed : fallback
  } catch {
    return value === 'true'
  }
}

const parseRetentionDays = (value: string | null): MentorRetentionDaysOption => {
  if (!value) return MENTOR_RETENTION_DAYS_DEFAULT

  try {
    const parsed = JSON.parse(value) as unknown
    const days = typeof parsed === 'number' ? parsed : Number.parseInt(String(parsed), 10)
    if (MENTOR_RETENTION_DAY_OPTIONS.includes(days as MentorRetentionDaysOption)) {
      return days as MentorRetentionDaysOption
    }
  } catch {
    const days = Number.parseInt(value, 10)
    if (MENTOR_RETENTION_DAY_OPTIONS.includes(days as MentorRetentionDaysOption)) {
      return days as MentorRetentionDaysOption
    }
  }

  return MENTOR_RETENTION_DAYS_DEFAULT
}

const parseLastPruneAt = (value: string | null): string | null => {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as unknown
    return typeof parsed === 'string' ? parsed : value
  } catch {
    return value
  }
}

const shouldRunScheduledPrune = (lastPruneAt: string | null, now = Date.now()): boolean => {
  if (!lastPruneAt) return true

  const last = Date.parse(lastPruneAt)
  if (Number.isNaN(last)) return true

  return now - last >= MENTOR_RETENTION_PRUNE_INTERVAL_MS
}

const syncChatStoreAfterPrune = async (): Promise<void> => {
  const { sessionId, hasHydrated } = useMentorChatStore.getState()
  if (!sessionId || !hasHydrated) return

  const session = await MentorChatRepository.findById(sessionId)
  if (session) return

  useMentorChatStore.setState({
    sessionId: null,
    messages: [],
    isGenerating: false,
    streamingText: '',
    hasHydrated: false,
    error: null,
    lastCapturedGoal: null,
  })
}

export const MentorRetentionService = {
  async getConfig(): Promise<MentorRetentionConfig> {
    const [enabledRaw, daysRaw] = await Promise.all([
      MentorMemoryRepository.get(MentorRetentionMemoryKey.ENABLED),
      MentorMemoryRepository.get(MentorRetentionMemoryKey.DAYS),
    ])

    return {
      enabled: parseBoolean(enabledRaw, true),
      retentionDays: parseRetentionDays(daysRaw),
    }
  },

  async setConfig(config: MentorRetentionConfig): Promise<void> {
    await Promise.all([
      MentorMemoryRepository.set(MentorRetentionMemoryKey.ENABLED, config.enabled),
      MentorMemoryRepository.set(MentorRetentionMemoryKey.DAYS, config.retentionDays),
    ])
  },

  async runPrune(options?: { force?: boolean }): Promise<MentorRetentionPruneResult> {
    const config = await MentorRetentionService.getConfig()

    if (!config.enabled) {
      return { ran: false, chatSessions: 0, errorLogs: 0, topics: 0, cutoffIso: null }
    }

    const lastPruneRaw = await MentorMemoryRepository.get(MentorRetentionMemoryKey.LAST_PRUNE_AT)
    const lastPruneAt = parseLastPruneAt(lastPruneRaw)

    if (!options?.force && !shouldRunScheduledPrune(lastPruneAt)) {
      return { ran: false, chatSessions: 0, errorLogs: 0, topics: 0, cutoffIso: null }
    }

    const cutoffIso = buildRetentionCutoffIso(config.retentionDays)

    const [chatSessions, errorLogs, topics] = await Promise.all([
      MentorChatRepository.deleteOlderThan(cutoffIso),
      MentorErrorRepository.deleteOlderThan(cutoffIso),
      MentorMemoryRepository.deleteTopicsOlderThan(cutoffIso),
    ])

    await MentorMemoryRepository.set(MentorRetentionMemoryKey.LAST_PRUNE_AT, nowIso())
    await syncChatStoreAfterPrune()

    return {
      ran: true,
      chatSessions,
      errorLogs,
      topics,
      cutoffIso,
    }
  },

  async runIfDue(): Promise<MentorRetentionPruneResult> {
    return MentorRetentionService.runPrune()
  },
}
