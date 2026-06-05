import { ScreenTabBar } from '@/components/ui/ScreenTabBar'

import { PROFILE_UI, type ProfileTab } from '../constants/profile-ui'

type ProfileTabSwitcherProps = {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

const TABS = [
  { id: 'identity' as const, label: PROFILE_UI.tabs.identity },
  { id: 'settings' as const, label: PROFILE_UI.tabs.settings },
]

export const ProfileTabSwitcher = ({ activeTab, onTabChange }: ProfileTabSwitcherProps) => (
  <ScreenTabBar tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />
)
