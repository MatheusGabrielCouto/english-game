import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

import { runThrottledHomeFocusRefresh } from '../services/home-focus-refresh-runner'

export const useHomeFocusRefresh = (): void => {
  useFocusEffect(
    useCallback(() => {
      runThrottledHomeFocusRefresh()
    }, []),
  )
}
