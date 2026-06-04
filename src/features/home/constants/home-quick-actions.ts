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
    route: routes.tabs.quests as Href,
    tagline: 'Diárias e semanais',
  },
  {
    id: 'english-journal',
    label: 'Vault',
    emoji: '📓',
    route: routes.englishJournal as Href,
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
    id: 'inventory',
    label: 'Inventário',
    emoji: '🎒',
    route: routes.inventory as Href,
    tagline: 'Itens e loot',
    exploreId: 'inventory',
  },
]

export const getEnabledHomeQuickActions = (): HomeQuickActionDef[] =>
  HOME_QUICK_ACTIONS.filter((action) => action.isEnabled?.() ?? true)
