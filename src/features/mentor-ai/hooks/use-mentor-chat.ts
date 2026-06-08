import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

import { MentorChatService } from '../services/mentor-chat-service'
import { useMentorChatStore } from '../store/mentor-chat-store'

export const useMentorChat = () => {
  const sessionId = useMentorChatStore((state) => state.sessionId)
  const messages = useMentorChatStore((state) => state.messages)
  const isGenerating = useMentorChatStore((state) => state.isGenerating)
  const streamingText = useMentorChatStore((state) => state.streamingText)
  const hasHydrated = useMentorChatStore((state) => state.hasHydrated)
  const error = useMentorChatStore((state) => state.error)
  const lastCapturedGoal = useMentorChatStore((state) => state.lastCapturedGoal)

  useFocusEffect(
    useCallback(() => {
      if (!hasHydrated) {
        void MentorChatService.hydrate()
      }
    }, [hasHydrated]),
  )

  const sendMessage = useCallback(
    async (text: string, options?: { llmText?: string }) => {
      await MentorChatService.sendMessage(text, options)
    },
    [],
  )

  const startNewSession = useCallback(async () => {
    await MentorChatService.startNewSession()
  }, [])

  const cancelGeneration = useCallback(() => {
    MentorChatService.cancelGeneration()
  }, [])

  return {
    sessionId,
    messages,
    isGenerating,
    streamingText,
    hasHydrated,
    error,
    lastCapturedGoal,
    sendMessage,
    startNewSession,
    cancelGeneration,
  }
}
