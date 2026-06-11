import { useEffect, type RefObject } from 'react'
import { type ScrollView } from 'react-native'

import { useCoachMarkStore } from '../store/coach-mark-store'

const REMEASURE_AFTER_SCROLL_MS = 480

export const useCoachMarkHomeScroll = (scrollRef: RefObject<ScrollView | null>) => {
  const homeScrollOffset = useCoachMarkStore((s) => s.homeScrollOffset)
  const clearHomeScroll = useCoachMarkStore((s) => s.clearHomeScroll)
  const requestRemeasure = useCoachMarkStore((s) => s.requestRemeasure)

  useEffect(() => {
    if (homeScrollOffset == null) return

    scrollRef.current?.scrollTo({ y: homeScrollOffset, animated: true })
    clearHomeScroll()

    const timer = setTimeout(() => {
      requestRemeasure()
    }, REMEASURE_AFTER_SCROLL_MS)

    return () => clearTimeout(timer)
  }, [clearHomeScroll, homeScrollOffset, requestRemeasure, scrollRef])
}
