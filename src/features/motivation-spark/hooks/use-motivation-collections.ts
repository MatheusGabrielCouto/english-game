import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

import type { MotivationCollectionRecord } from '@/types/motivation-spark'

import { MotivationCollectionService } from '../services/motivation-collection-service'

export const useMotivationCollections = () => {
  const [collections, setCollections] = useState<MotivationCollectionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await MotivationCollectionService.list()
      setCollections(records)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void refresh()
    }, [refresh]),
  )

  return { collections, isLoading, refresh }
}
