import { usePlayerStore } from '@/features/player'
import { useExploreBadges, type ExploreBadge } from '@/features/profile/hooks/use-explore-badges'

import type { MenuHubItemDef } from '../constants/menu-hub-catalog'
import { getMenuHubUnlockLabel, isMenuHubItemUnlocked } from '../utils/menu-hub-unlock'

export const useMenuHubBadge = (item: MenuHubItemDef): ExploreBadge => {
  const playerLevel = usePlayerStore((s) => s.level)
  const badges = useExploreBadges()

  if (!isMenuHubItemUnlocked(item, playerLevel) && item.requiredLevel != null) {
    return {
      label: getMenuHubUnlockLabel(item.requiredLevel),
      tone: 'locked',
    }
  }

  if (item.exploreId) {
    return badges[item.exploreId]
  }

  if (item.id === 'shop') {
    return { label: 'Loja', tone: 'default' }
  }

  if (item.id === 'knowledge-map') {
    return badges['english-journal']
  }

  if (item.id === 'knowledge-collections') {
    return { label: 'Listas', tone: 'default' }
  }

  return { label: '', tone: 'default' }
}
