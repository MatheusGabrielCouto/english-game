import { useCallback } from 'react'

import type { MentorInterviewTrackValue, MentorRoleplayRoleValue } from '@/types/mentor-ai'

import { MentorRoleplayService } from '../services/mentor-roleplay-service'
import { useMentorRoleplayStore } from '../store/mentor-roleplay-store'

export const useMentorRoleplay = () => {
  const phase = useMentorRoleplayStore((state) => state.phase)
  const mode = useMentorRoleplayStore((state) => state.mode)
  const role = useMentorRoleplayStore((state) => state.role)
  const track = useMentorRoleplayStore((state) => state.track)
  const messages = useMentorRoleplayStore((state) => state.messages)
  const turnCount = useMentorRoleplayStore((state) => state.turnCount)
  const isGenerating = useMentorRoleplayStore((state) => state.isGenerating)
  const streamingText = useMentorRoleplayStore((state) => state.streamingText)
  const error = useMentorRoleplayStore((state) => state.error)
  const feedback = useMentorRoleplayStore((state) => state.feedback)

  const startConversation = useCallback(async (selectedRole: MentorRoleplayRoleValue) => {
    await MentorRoleplayService.startConversation(selectedRole)
  }, [])

  const startInterview = useCallback(async (selectedTrack: MentorInterviewTrackValue) => {
    await MentorRoleplayService.startInterview(selectedTrack)
  }, [])

  const sendMessage = useCallback(
    async (text: string, options?: { llmText?: string }) => {
      await MentorRoleplayService.sendMessage(text, options)
    },
    [],
  )

  const finishSession = useCallback(async () => {
    await MentorRoleplayService.finishSession()
  }, [])

  const backToPicker = useCallback(() => {
    MentorRoleplayService.backToPicker()
  }, [])

  const reset = useCallback(() => {
    MentorRoleplayService.reset()
  }, [])

  const cancelGeneration = useCallback(() => {
    MentorRoleplayService.cancelGeneration()
  }, [])

  return {
    phase,
    mode,
    role,
    track,
    messages,
    turnCount,
    isGenerating,
    streamingText,
    error,
    feedback,
    startConversation,
    startInterview,
    sendMessage,
    finishSession,
    backToPicker,
    reset,
    cancelGeneration,
  }
}
