import { createContext, type ReactNode, useContext } from 'react'
import type { SharedValue } from 'react-native-reanimated'

const GameCardPressContext = createContext<SharedValue<number> | null>(null)

type GameCardPressProviderProps = {
  intensity: SharedValue<number>
  children: ReactNode
}

export const GameCardPressProvider = ({ intensity, children }: GameCardPressProviderProps) => (
  <GameCardPressContext.Provider value={intensity}>{children}</GameCardPressContext.Provider>
)

export const useGameCardPressIntensity = (): SharedValue<number> | null =>
  useContext(GameCardPressContext)
