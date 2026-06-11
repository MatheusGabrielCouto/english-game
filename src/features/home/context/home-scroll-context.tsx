import { createContext, useContext, type RefObject } from 'react'
import type { View } from 'react-native'

type HomeScrollContextValue = {
  contentRef: RefObject<View | null>
}

const HomeScrollContext = createContext<HomeScrollContextValue | null>(null)

export const HomeScrollProvider = HomeScrollContext.Provider

export const useHomeScrollContentRef = () => useContext(HomeScrollContext)?.contentRef ?? null
