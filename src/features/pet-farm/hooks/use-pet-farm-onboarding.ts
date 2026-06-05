import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'eq:pet-farm-onboarding-complete'

type UsePetFarmOnboardingResult = {
  isComplete: boolean
  isReady: boolean
  shouldShowWelcome: boolean
  complete: () => void
}

export const usePetFarmOnboarding = (): UsePetFarmOnboardingResult => {
  const [isComplete, setIsComplete] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (cancelled) return
      setIsComplete(value === '1')
      setIsReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const complete = useCallback(() => {
    setIsComplete(true)
    void AsyncStorage.setItem(STORAGE_KEY, '1')
  }, [])

  return {
    isComplete,
    isReady,
    shouldShowWelcome: isReady && !isComplete,
    complete,
  }
}
