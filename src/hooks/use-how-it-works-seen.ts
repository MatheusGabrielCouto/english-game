import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'

export type HowItWorksScreenKey =
  | 'achievements'
  | 'city'
  | 'collection-book'
  | 'contracts'
  | 'prestige'
  | 'titles'

const storageKey = (key: HowItWorksScreenKey) => `eq:how-it-works-seen:${key}`

type UseHowItWorksSeenResult = {
  shouldShow: boolean
  isReady: boolean
  markSeen: () => void
}

export const useHowItWorksSeen = (key: HowItWorksScreenKey): UseHowItWorksSeenResult => {
  const [shouldShow, setShouldShow] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const shouldShowRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    void AsyncStorage.getItem(storageKey(key)).then((value) => {
      if (cancelled) return

      const show = value !== '1'
      shouldShowRef.current = show
      setShouldShow(show)
      setIsReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [key])

  const markSeen = useCallback(() => {
    if (!shouldShowRef.current) return

    shouldShowRef.current = false
    setShouldShow(false)
    void AsyncStorage.setItem(storageKey(key), '1')
  }, [key])

  useFocusEffect(
    useCallback(() => {
      return () => {
        markSeen()
      }
    }, [markSeen]),
  )

  return {
    shouldShow: isReady && shouldShow,
    isReady,
    markSeen,
  }
}
