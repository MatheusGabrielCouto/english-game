import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import type { MenuHubItemId } from '../constants/menu-hub-catalog'

const STORAGE_KEY = 'menu_hub_pinned_ids_v1'
export const MENU_HUB_MAX_PINS = 5

type MenuHubState = {
  pinnedIds: MenuHubItemId[]
  _hasHydrated: boolean
  hydrate: () => Promise<void>
  togglePin: (id: MenuHubItemId) => boolean
  isPinned: (id: MenuHubItemId) => boolean
}

const persistPins = async (ids: MenuHubItemId[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export const useMenuHubStore = create<MenuHubState>()((set, get) => ({
  pinnedIds: [],
  _hasHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as MenuHubItemId[]) : []
      set({ pinnedIds: Array.isArray(parsed) ? parsed.slice(0, MENU_HUB_MAX_PINS) : [], _hasHydrated: true })
    } catch {
      set({ pinnedIds: [], _hasHydrated: true })
    }
  },

  togglePin: (id) => {
    const { pinnedIds } = get()
    if (pinnedIds.includes(id)) {
      const next = pinnedIds.filter((pin) => pin !== id)
      set({ pinnedIds: next })
      void persistPins(next)
      return true
    }
    if (pinnedIds.length >= MENU_HUB_MAX_PINS) return false
    const next = [...pinnedIds, id]
    set({ pinnedIds: next })
    void persistPins(next)
    return true
  },

  isPinned: (id) => get().pinnedIds.includes(id),
}))
