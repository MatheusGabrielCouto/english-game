import { MentorChatRepository } from '@/storage/repositories/mentor-chat-repository'
import { MentorErrorRepository } from '@/storage/repositories/mentor-error-repository'
import { MentorMemoryRepository } from '@/storage/repositories/mentor-memory-repository'

import { useMentorChatStore } from '../store/mentor-chat-store'
import { MentorModelBootstrap } from './mentor-model-bootstrap'

export type MentorSettingsStats = {
  chatSessions: number
  errorLogs: number
  memoryEntries: number
}

export const MentorSettingsService = {
  async loadStats(): Promise<MentorSettingsStats> {
    const [chatSessions, errorLogs, memoryEntries] = await Promise.all([
      MentorChatRepository.countAll(),
      MentorErrorRepository.countAll(),
      MentorMemoryRepository.countUserEntries(),
    ])

    return { chatSessions, errorLogs, memoryEntries }
  },

  async retryModelLoad(): Promise<void> {
    await MentorModelBootstrap.initialize()
  },

  async clearChatHistory(): Promise<void> {
    await MentorChatRepository.deleteAll()
    useMentorChatStore.setState({
      sessionId: null,
      messages: [],
      isGenerating: false,
      streamingText: '',
      hasHydrated: false,
      error: null,
      lastCapturedGoal: null,
    })
  },

  async clearMentorData(): Promise<void> {
    await Promise.all([
      MentorChatRepository.deleteAll(),
      MentorErrorRepository.deleteAll(),
      MentorMemoryRepository.deleteAll(),
    ])

    useMentorChatStore.setState({
      sessionId: null,
      messages: [],
      isGenerating: false,
      streamingText: '',
      hasHydrated: false,
      error: null,
      lastCapturedGoal: null,
    })
  },
}
