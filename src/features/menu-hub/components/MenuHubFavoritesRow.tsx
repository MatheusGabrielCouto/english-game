import { ScrollView, View } from 'react-native'

import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import type { MenuHubItemDef } from '@/features/menu-hub/constants/menu-hub-catalog'
import { MENU_HUB_UI } from '@/features/menu-hub/constants/menu-hub-ui'
import { MenuHubCard } from './MenuHubCard'

type MenuHubFavoritesRowProps = {
  items: MenuHubItemDef[]
}

export const MenuHubFavoritesRow = ({ items }: MenuHubFavoritesRowProps) => {
  if (items.length === 0) return null

  return (
    <View className="gap-3">
      <HomeSectionLabel
        emoji="📌"
        title={MENU_HUB_UI.favoritesTitle}
        subtitle={MENU_HUB_UI.favoritesHint}
        tone="gold"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="items-start gap-2 pr-2">
        {items.map((item) => (
          <MenuHubCard key={`pin-${item.id}`} item={item} variant="featured" />
        ))}
      </ScrollView>
    </View>
  )
}
