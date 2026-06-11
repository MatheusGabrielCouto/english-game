import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

import { isApplicationStoresHydrated } from '@/storage/application-hydration'

import { runThrottledHomeFocusRefresh } from '../services/home-focus-refresh-runner'

export const useHomeFocusRefresh = (): void => {
  useFocusEffect(
    useCallback(() => {
      if (!isApplicationStoresHydrated()) return
      runThrottledHomeFocusRefresh()
    }, []),
  )
}
