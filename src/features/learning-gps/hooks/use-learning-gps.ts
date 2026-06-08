import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect } from 'react'

import { useAppStore } from '@/features/app/store/app-store'
import { GameEvents } from '@/services/game-events'

import { LearningGpsService } from '../services/learning-gps-service'
import { useLearningGpsStore } from '../store/learning-gps-store'

export const useLearningGps = () => {
  const snapshot = useLearningGpsStore((state) => state.snapshot)
  const hasHydrated = useLearningGpsStore((state) => state.hasHydrated)
  const isSyncing = useLearningGpsStore((state) => state.isSyncing)
  const difficulty = useAppStore((state) => state.difficulty)

  const refresh = useCallback(async () => {
    await LearningGpsService.refresh()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!hasHydrated) {
        void LearningGpsService.hydrate()
        return
      }
      void refresh()
    }, [hasHydrated, refresh]),
  )

  useEffect(() => {
    const unsubscribe = GameEvents.subscribe((event) => {
      if (
        event.type === 'FARM_ACTIVITY_RECORDED' ||
        event.type === 'LEARNING_BLOCK_COMPLETED' ||
        event.type === 'LEARNING_UNIT_COMPLETED' ||
        event.type === 'LEARNING_WORLD_ADVANCED' ||
        event.type === 'ROUTINE_COMPLETED' ||
        event.type === 'ROUTINE_CREATED' ||
        event.type === 'DUEL_WON'
      ) {
        void refresh()
      }
    })
    return unsubscribe
  }, [refresh])

  useEffect(() => {
    void refresh()
  }, [difficulty, refresh])

  return {
    snapshot,
    hasHydrated,
    isSyncing,
    difficulty,
    refresh,
  }
}
