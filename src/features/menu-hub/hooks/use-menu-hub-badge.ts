import { useExploreBadges, type ExploreBadge } from '@/features/profile/hooks/use-explore-badges'
import type { MenuHubItemDef } from '../constants/menu-hub-catalog'

export const useMenuHubBadge = (item: MenuHubItemDef): ExploreBadge => {
  const badges = useExploreBadges()

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
