import { Pressable, Text, View } from 'react-native'

import { QUESTS_UI, type QuestsTab } from '@/features/quests/constants/quests-ui'
import { cn } from '@/utils'

type QuestsTabSwitcherProps = {
  activeTab: QuestsTab
  onTabChange: (tab: QuestsTab) => void
  badges?: Partial<Record<QuestsTab, number>>
}

const TABS: { id: QuestsTab; label: string }[] = [
  { id: 'today', label: QUESTS_UI.tabs.today },
  { id: 'week', label: QUESTS_UI.tabs.week },
  { id: 'epic', label: QUESTS_UI.tabs.epic },
]

export const QuestsTabSwitcher = ({ activeTab, onTabChange, badges }: QuestsTabSwitcherProps) => (
  <View className="flex-row rounded-2xl border border-border bg-surface p-1" accessibilityRole="tablist">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.id
      const badge = badges?.[tab.id]

      return (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={
            badge && badge > 0 ? `${tab.label}, ${badge} pendente${badge > 1 ? 's' : ''}` : tab.label
          }
          className={cn('flex-1 flex-row items-center justify-center rounded-xl py-2.5', isActive && 'bg-primary')}>
          <Text
            className={cn(
              'text-center text-sm font-semibold',
              isActive ? 'text-primary-foreground' : 'text-foreground-secondary',
            )}>
            {tab.label}
          </Text>
          {badge && badge > 0 ? (
            <View
              className={cn(
                'ml-1.5 min-w-[18px] rounded-full px-1.5 py-0.5',
                isActive ? 'bg-primary-foreground/20' : 'bg-danger/15',
              )}>
              <Text
                className={cn(
                  'text-center text-[10px] font-bold',
                  isActive ? 'text-primary-foreground' : 'text-danger',
                )}>
                {badge}
              </Text>
            </View>
          ) : null}
        </Pressable>
      )
    })}
  </View>
)
