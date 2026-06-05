import type { Href } from 'expo-router'
import { Platform } from 'react-native'

import { routes } from '@/constants'
import { isDuelsEnabled, isFlashDeckEnabled } from '@/constants/feature-flags'
import type { ExploreItemId } from '@/features/profile/constants/profile-explore-catalog'

export type HomeQuickActionId =
  | 'quests'
  | 'english-journal'
  | 'routines'
  | 'flash-deck'
  | 'duels'
  | 'farm'
  | 'focus'
  | 'city'
  | 'pet'
  | 'shop'
  | 'inventory'

export type HomeQuickActionDef = {
  id: HomeQuickActionId
  label: string
  emoji: string
  route: Href
  tagline: string
  exploreId?: ExploreItemId
  isEnabled?: () => boolean
}

const focusEnabled = () => Platform.OS === 'android'

export const HOME_QUICK_ACTIONS: HomeQuickActionDef[] = [
  {
    id: 'quests',
    label: 'Missões',
    emoji: '🎯',
    route: routes.tabs.play as Href,
    tagline: 'Diárias e semanais',
  },
  {
    id: 'english-journal',
    label: 'Vault',
    emoji: '📓',
    route: routes.tabs.knowledge as Href,
    tagline: 'Notas e mapa',
    exploreId: 'english-journal',
  },
  {
    id: 'routines',
    label: 'Rotinas',
    emoji: '📋',
    route: routes.routines as Href,
    tagline: 'Hábitos de hoje',
    exploreId: 'routines',
  },
  {
    id: 'flash-deck',
    label: 'Baralho',
    emoji: '📒',
    route: routes.flashDeck as Href,
    tagline: 'Flashcards',
    exploreId: 'flash-deck',
    isEnabled: isFlashDeckEnabled,
  },
  {
    id: 'duels',
    label: 'Duelos',
    emoji: '⚔️',
    route: routes.duels as Href,
    tagline: 'Arena MCQ',
    exploreId: 'duels',
    isEnabled: isDuelsEnabled,
  },
  {
    id: 'farm',
    label: 'Farm',
    emoji: '🌾',
    route: routes.farm as Href,
    tagline: 'Pontos de estudo',
    exploreId: 'farm',
  },
  {
    id: 'focus',
    label: 'Focus',
    emoji: '🎯',
    route: routes.focusMode as Href,
    tagline: Platform.OS === 'android' ? 'Bloqueio de apps' : 'Só Android',
    exploreId: 'focus',
    isEnabled: focusEnabled,
  },
  {
    id: 'city',
    label: 'Cidade',
    emoji: '🏙️',
    route: routes.city as Href,
    tagline: 'Evoluir skyline',
    exploreId: 'city',
  },
  {
    id: 'pet',
    label: 'Pet',
    emoji: '🐾',
    route: routes.pet as Href,
    tagline: 'Companheiro',
    exploreId: 'pet',
  },
  {
    id: 'shop',
    label: 'Loja',
    emoji: '🛒',
    route: routes.shop as Href,
    tagline: 'Compre upgrades e itens',
  },
  {
    id: 'inventory',
    label: 'Inventário',
    emoji: '🎒',
    route: routes.inventory as Href,
    tagline: 'Itens e loot',
    exploreId: 'inventory',
  },
]

export const HOME_QUICK_ACTION_VISIBLE_IDS: HomeQuickActionId[] = [
  'quests',
  'english-journal',
  'city',
  'pet',
  'shop',
  'flash-deck',
]

/** Fills the Home grid when a featured action is disabled (e.g. flash-deck flag). */
export const HOME_QUICK_ACTION_OVERFLOW_IDS: HomeQuickActionId[] = [
  'routines',
  'inventory',
  'farm',
  'duels',
  'focus',
]

export const HOME_QUICK_ACTIONS_LIMIT = 6

export const getEnabledHomeQuickActions = (): HomeQuickActionDef[] =>
  HOME_QUICK_ACTIONS.filter((action) => action.isEnabled?.() ?? true)

export const getHomeQuickActionsForDisplay = (): HomeQuickActionDef[] => {
  const enabledById = new Map(
    getEnabledHomeQuickActions().map((action) => [action.id, action]),
  )

  const visible: HomeQuickActionDef[] = []

  for (const id of HOME_QUICK_ACTION_VISIBLE_IDS) {
    const action = enabledById.get(id)
    if (action) visible.push(action)
  }

  if (visible.length < HOME_QUICK_ACTIONS_LIMIT) {
    for (const id of HOME_QUICK_ACTION_OVERFLOW_IDS) {
      if (visible.length >= HOME_QUICK_ACTIONS_LIMIT) break
      const action = enabledById.get(id)
      if (action && !visible.some((item) => item.id === action.id)) {
        visible.push(action)
      }
    }
  }

  return visible.slice(0, HOME_QUICK_ACTIONS_LIMIT)
}
