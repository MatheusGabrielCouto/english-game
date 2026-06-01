import { useEffect, useState } from 'react'

import { AppLogService } from '@/services/app-log-service'
import { hydrateBackgroundServices, hydrateCriticalStores } from '@/storage'
import { runInBackground } from '@/utils/defer-work'

export const useAppHydration = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    hydrateCriticalStores()
      .then(() => {
        if (!cancelled) setIsReady(true)

        runInBackground('hydrate_services', async () => {
          await hydrateBackgroundServices()
        })
      })
      .catch((error) => {
        AppLogService.error('hydration.failed', 'Failed to hydrate critical stores from SQLite', {
          message: error instanceof Error ? error.message : String(error),
        })
        if (!cancelled) setIsReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return isReady
}
