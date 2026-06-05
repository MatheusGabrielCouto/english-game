import { ScreenTabBar } from '@/components/ui/ScreenTabBar'

import { PLAY_UI, type PlayTab } from '../constants/play-ui'

type PlayTabSwitcherProps = {
  activeTab: PlayTab
  onTabChange: (tab: PlayTab) => void
  badges?: Partial<Record<PlayTab, number>>
}

const TABS = [
  { id: 'missions' as const, label: PLAY_UI.tabs.missions },
  { id: 'routines' as const, label: PLAY_UI.tabs.routines },
]

export const PlayTabSwitcher = ({ activeTab, onTabChange, badges }: PlayTabSwitcherProps) => (
  <ScreenTabBar
    tabs={TABS.map((tab) => ({ ...tab, badge: badges?.[tab.id] }))}
    activeTab={activeTab}
    onTabChange={onTabChange}
  />
)
