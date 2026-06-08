import { ScreenTabBar } from '@/components/ui/ScreenTabBar'

import { LEARNING_GPS_UI } from '../constants/learning-gps-ui'

export type LearningGpsTab = 'today' | 'trail' | 'insights'

type LearningGpsTabSwitcherProps = {
  activeTab: LearningGpsTab
  onTabChange: (tab: LearningGpsTab) => void
  todayBadge?: number
  insightsBadge?: number
}

const TABS = [
  { id: 'today' as const, label: LEARNING_GPS_UI.tabs.today },
  { id: 'trail' as const, label: LEARNING_GPS_UI.tabs.trail },
  { id: 'insights' as const, label: LEARNING_GPS_UI.tabs.insights },
]

export const LearningGpsTabSwitcher = ({
  activeTab,
  onTabChange,
  todayBadge,
  insightsBadge,
}: LearningGpsTabSwitcherProps) => (
  <ScreenTabBar
    tabs={TABS.map((tab) => ({
      ...tab,
      badge:
        tab.id === 'today'
          ? todayBadge
          : tab.id === 'insights'
            ? insightsBadge
            : undefined,
    }))}
    activeTab={activeTab}
    onTabChange={onTabChange}
  />
)
