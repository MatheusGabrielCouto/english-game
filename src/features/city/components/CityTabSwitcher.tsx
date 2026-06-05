import { ScreenTabBar } from '@/components/ui/ScreenTabBar'

import { CITY_UI } from '../constants/city-ui'

type CityTab = 'map' | 'summary'

type CityTabSwitcherProps = {
  activeTab: CityTab
  onTabChange: (tab: CityTab) => void
}

const TABS = [
  { id: 'map' as const, label: CITY_UI.tabMap },
  { id: 'summary' as const, label: CITY_UI.tabSummary },
]

export const CityTabSwitcher = ({ activeTab, onTabChange }: CityTabSwitcherProps) => (
  <ScreenTabBar tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />
)
