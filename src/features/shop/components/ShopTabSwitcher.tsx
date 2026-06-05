import { Pressable, Text, View } from 'react-native'

import { SHOP_UI, type ShopTab } from '@/features/shop/constants/shop-ui'
import { cn } from '@/utils'

type ShopTabSwitcherProps = {
  activeTab: ShopTab
  onTabChange: (tab: ShopTab) => void
}

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'coins', label: SHOP_UI.tabs.coins },
  { id: 'offers', label: SHOP_UI.tabs.offers },
  { id: 'sp', label: SHOP_UI.tabs.sp },
]

export const ShopTabSwitcher = ({ activeTab, onTabChange }: ShopTabSwitcherProps) => (
  <View className="flex-row rounded-2xl border border-border bg-surface p-1" accessibilityRole="tablist">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.id

      return (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={tab.label}
          className={cn('flex-1 rounded-xl py-2.5', isActive && 'bg-primary')}>
          <Text
            className={cn(
              'text-center text-sm font-semibold',
              isActive ? 'text-primary-foreground' : 'text-foreground-secondary',
            )}>
            {tab.label}
          </Text>
        </Pressable>
      )
    })}
  </View>
)
