import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect } from 'react'

import { GameEvents } from '@/services/game-events'

import { MentorAIService } from '../services/mentor-ai-service'
import { useMentorAiStore } from '../store/mentor-ai-store'

export const useMentorAi = () => {
  const snapshot = useMentorAiStore((state) => state.snapshot)
  const hasHydrated = useMentorAiStore((state) => state.hasHydrated)
  const isSyncing = useMentorAiStore((state) => state.isSyncing)

  const refresh = useCallback(async () => {
    await MentorAIService.refresh()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!hasHydrated) {
        void MentorAIService.hydrate()
        return
      }
      void refresh()
    }, [hasHydrated, refresh]),
  )

  useEffect(() => {
    const unsubscribe = GameEvents.subscribe((event) => {
      if (
        event.type === 'LEARNING_BLOCK_COMPLETED' ||
        event.type === 'LEARNING_UNIT_COMPLETED' ||
        event.type === 'LEARNING_WORLD_ADVANCED' ||
        event.type === 'ROUTINE_COMPLETED' ||
        event.type === 'DUEL_WON' ||
        event.type === 'DUEL_LOST' ||
        event.type === 'FLASH_SESSION_DONE' ||
        event.type === 'MENTOR_CHAT_STARTED' ||
        event.type === 'MENTOR_SESSION_COMPLETED' ||
        event.type === 'MENTOR_EXERCISE_COMPLETED' ||
        event.type === 'MENTOR_ROLEPLAY_COMPLETED'
      ) {
        void refresh()
      }
    })
    return unsubscribe
  }, [refresh])

  return {
    snapshot,
    hasHydrated,
    isSyncing,
    refresh,
  }
}
