import { create } from 'zustand'

import { GameEvents } from '@/services/game-events'
import { savePlayer } from '@/storage/repositories/player-repository'
import type { Player, Stats } from '@/types/player'
import { debounce } from '@/utils/debounce'

import { DEFAULT_PLAYER_TITLE } from '../constants'
import { applySingleLevelUp, applyXPWithLevelUps } from '../utils/xp'

type PlayerState = Player &
  Stats & {
    _hasHydrated: boolean
    setName: (name: string) => void
    setTitle: (title: string) => void
    setLastStudyDate: (date: string) => void
    addXP: (amount: number) => void
    addCoins: (amount: number) => void
    addMissionRewards: (xp: number, coins: number) => void
    removeCoins: (amount: number) => boolean
    levelUp: () => boolean
    setHasHydrated: (value: boolean) => void
  }

const createInitialPlayer = (): Pick<
  Player,
  'name' | 'level' | 'xp' | 'coins' | 'title' | 'createdAt' | 'lastStudyDate'
> => ({
  name: 'Aventureiro',
  level: 1,
  xp: 0,
  coins: 0,
  title: DEFAULT_PLAYER_TITLE,
  createdAt: new Date().toISOString(),
  lastStudyDate: null,
})

const initialStats: Stats = {
  currentStreak: 0,
  bestStreak: 0,
  totalStudyDays: 0,
  shields: 0,
}

const pickPersistPayload = (state: PlayerState) => ({
  name: state.name,
  level: state.level,
  xp: state.xp,
  coins: state.coins,
  title: state.title,
  createdAt: state.createdAt,
  lastStudyDate: state.lastStudyDate,
  currentStreak: state.currentStreak,
  bestStreak: state.bestStreak,
  totalStudyDays: state.totalStudyDays,
  shields: state.shields,
})

let persistGetter: (() => PlayerState) | null = null

const flushPersist = debounce(() => {
  if (!persistGetter) return
  void savePlayer(pickPersistPayload(persistGetter()))
}, 350)

const schedulePersist = (get: () => PlayerState) => {
  persistGetter = get
  flushPersist()
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  ...createInitialPlayer(),
  ...initialStats,
  _hasHydrated: false,

  setName: (name) => {
    set({ name })
    schedulePersist(get)
  },

  setTitle: (title) => {
    set({ title })
    schedulePersist(get)
  },

  setLastStudyDate: (date) => {
    set({ lastStudyDate: date })
    schedulePersist(get)
  },

  addXP: (amount) => {
    if (amount <= 0) return

    const { level, xp, coins } = get()
    const result = applyXPWithLevelUps(level, xp, amount)

    set({
      level: result.level,
      xp: result.xp,
      coins: coins + result.totalCoinsEarned,
    })
    schedulePersist(get)
    GameEvents.emit({ type: 'XP_GAINED', amount })

    if (result.levelsGained > 0) {
      GameEvents.emit({
        type: 'PLAYER_LEVEL_UP',
        level: result.level,
        previousLevel: level,
        levelsGained: result.levelsGained,
      })
    }
  },

  addCoins: (amount) => {
    if (amount <= 0) return
    set((state) => ({ coins: state.coins + amount }))
    schedulePersist(get)
  },

  addMissionRewards: (xp, coins) => {
    if (xp <= 0 && coins <= 0) return

    const { level, xp: currentXp, coins: currentCoins } = get()
    const result = xp > 0 ? applyXPWithLevelUps(level, currentXp, xp) : null

    set({
      level: result?.level ?? level,
      xp: result?.xp ?? currentXp,
      coins: currentCoins + (result?.totalCoinsEarned ?? 0) + Math.max(0, coins),
    })
    schedulePersist(get)

    if (xp > 0) {
      GameEvents.emit({ type: 'XP_GAINED', amount: xp })
    }
    if (result && result.levelsGained > 0) {
      GameEvents.emit({
        type: 'PLAYER_LEVEL_UP',
        level: result.level,
        previousLevel: level,
        levelsGained: result.levelsGained,
      })
    }
  },

  removeCoins: (amount) => {
    if (amount <= 0) return true

    const { coins } = get()
    if (coins < amount) return false

    set({ coins: coins - amount })
    schedulePersist(get)
    return true
  },

  levelUp: () => {
    const { level, xp, coins } = get()
    const result = applySingleLevelUp(level, xp)

    if (!result.didLevelUp) return false

    set({
      level: result.level,
      xp: result.xp,
      coins: coins + result.coinsEarned,
    })
    schedulePersist(get)
    GameEvents.emit({
      type: 'PLAYER_LEVEL_UP',
      level: result.level,
      previousLevel: level,
      levelsGained: 1,
    })
    return true
  },

  setHasHydrated: (value) => set({ _hasHydrated: value }),
}))
