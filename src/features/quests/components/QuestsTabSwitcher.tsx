import { ScreenTabBar } from '@/components/ui/ScreenTabBar'

import { QUESTS_UI, type QuestsTab } from '@/features/quests/constants/quests-ui'

type QuestsTabSwitcherProps = {
  activeTab: QuestsTab
  onTabChange: (tab: QuestsTab) => void
  badges?: Partial<Record<QuestsTab, number>>
}

const TABS = [
  { id: 'today' as const, label: QUESTS_UI.tabs.today },
  { id: 'week' as const, label: QUESTS_UI.tabs.week },
  { id: 'epic' as const, label: QUESTS_UI.tabs.epic },
]

export const QuestsTabSwitcher = ({ activeTab, onTabChange, badges }: QuestsTabSwitcherProps) => (
  <ScreenTabBar
    tabs={TABS.map((tab) => ({ ...tab, badge: badges?.[tab.id] }))}
    activeTab={activeTab}
    onTabChange={onTabChange}
  />
)
