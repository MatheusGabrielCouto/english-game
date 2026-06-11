import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'

import { shouldSkipHydratedStoreReread } from '@/storage/startup-read-policy'
import { getMotivationSettings } from '@/storage/repositories/motivation-settings-repository'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import {
    MotivationDailyPickService,
    type MotivationDailySparkSnapshot,
} from '../services/motivation-daily-pick-service'

export const useDailyMotivationSpark = () => {
  const [snapshot, setSnapshot] = useState<MotivationDailySparkSnapshot | null>(null)
  const [showOnHome, setShowOnHome] = useState(true)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const refresh = useCallback(async () => {
    setIsSyncing(true)
    try {
      const [settings, daily] = await Promise.all([
        getMotivationSettings(),
        MotivationDailyPickService.getDailySpark(),
      ])
      setShowOnHome(settings.showOnHome)
      setSnapshot(daily)
      setHasHydrated(true)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (shouldSkipHydratedStoreReread(hasHydrated, { withinFocusGrace: true })) return
      void refresh()
    }, [hasHydrated, refresh]),
  )

  const spark: MotivationSparkRecord | null = snapshot?.spark ?? null

  return {
    spark,
    snapshot,
    showOnHome,
    hasHydrated,
    isSyncing,
    refresh,
  }
}
