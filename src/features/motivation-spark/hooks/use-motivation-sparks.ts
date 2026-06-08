import { useCallback, useEffect } from 'react'

import { MotivationSparkService } from '../services/motivation-spark-service'
import { useMotivationSparksStore } from '../store/motivation-sparks-store'

export const useMotivationSparks = () => {
  const sparks = useMotivationSparksStore((state) => state.sparks)
  const hasHydrated = useMotivationSparksStore((state) => state.hasHydrated)
  const isSyncing = useMotivationSparksStore((state) => state.isSyncing)

  const hydrate = useCallback(async () => {
    if (isSyncing) return
    useMotivationSparksStore.setState({ isSyncing: true })
    try {
      await MotivationSparkService.hydrate()
    } finally {
      useMotivationSparksStore.setState({ isSyncing: false })
    }
  }, [isSyncing])

  useEffect(() => {
    if (!hasHydrated && !isSyncing) {
      void hydrate()
    }
  }, [hasHydrated, hydrate, isSyncing])

  return {
    sparks,
    hasHydrated,
    isSyncing,
    hydrate,
    refresh: hydrate,
  }
}
