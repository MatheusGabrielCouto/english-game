import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

import { GameEvents } from '@/services/game-events'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MotivationSparkService } from '../services/motivation-spark-service'

export const useArchivedMotivationSparks = () => {
  const [sparks, setSparks] = useState<MotivationSparkRecord[]>([])
  const [archivedCount, setArchivedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [records, count] = await Promise.all([
        MotivationSparkService.listArchived(),
        MotivationSparkService.countArchived(),
      ])
      setSparks(records)
      setArchivedCount(count)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void refresh()
    }, [refresh]),
  )

  useEffect(() => {
    const unsubscribe = GameEvents.subscribe((event) => {
      if (
        event.type === 'MOTIVATION_SPARK_UPDATED' ||
        event.type === 'MOTIVATION_SPARK_DELETED'
      ) {
        void refresh()
      }
    })
    return unsubscribe
  }, [refresh])

  return { sparks, archivedCount, isLoading, refresh }
}
