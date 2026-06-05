import { ScreenTabBar } from '@/components/ui/ScreenTabBar'

import { SHOP_UI, type ShopTab } from '@/features/shop/constants/shop-ui'

type ShopTabSwitcherProps = {
  activeTab: ShopTab
  onTabChange: (tab: ShopTab) => void
}

const TABS = [
  { id: 'coins' as const, label: SHOP_UI.tabs.coins },
  { id: 'offers' as const, label: SHOP_UI.tabs.offers },
  { id: 'sp' as const, label: SHOP_UI.tabs.sp },
]

export const ShopTabSwitcher = ({ activeTab, onTabChange }: ShopTabSwitcherProps) => (
  <ScreenTabBar tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />
)
