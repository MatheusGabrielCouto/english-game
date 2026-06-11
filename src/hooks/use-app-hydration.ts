import { useEffect, useState } from 'react'

import { AppLogService } from '@/services/app-log-service'
import { StartupPerfService } from '@/services/startup-perf-service'
import {
  finishHydrationProgress,
  hydrateStoresFromDatabase,
  recoverBackgroundHydrationFailure,
  resetHydrationProgress,
} from '@/storage'

export const useAppHydration = () => {
  const [hydrationDone, setHydrationDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    resetHydrationProgress()
    StartupPerfService.mark('hydration_start')

    void hydrateStoresFromDatabase()
      .then(() => {
        StartupPerfService.mark('hydration_critical_done')
        StartupPerfService.mark('hydration_background_done')
        finishHydrationProgress()
        if (!cancelled) setHydrationDone(true)
      })
      .catch((error) => {
        AppLogService.error('hydration.failed', 'Failed to hydrate stores from SQLite', {
          message: error instanceof Error ? error.message : String(error),
        })
        recoverBackgroundHydrationFailure()
        finishHydrationProgress()
        if (!cancelled) setHydrationDone(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return hydrationDone
}
