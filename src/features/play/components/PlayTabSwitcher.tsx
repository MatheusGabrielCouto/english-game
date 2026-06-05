import { Pressable, Text, View } from 'react-native'

import { cn } from '@/utils'

import { PLAY_UI, type PlayTab } from '../constants/play-ui'

type PlayTabSwitcherProps = {
  activeTab: PlayTab
  onTabChange: (tab: PlayTab) => void
  badges?: Partial<Record<PlayTab, number>>
}

const TABS: { id: PlayTab; label: string }[] = [
  { id: 'missions', label: PLAY_UI.tabs.missions },
  { id: 'routines', label: PLAY_UI.tabs.routines },
]

export const PlayTabSwitcher = ({ activeTab, onTabChange, badges }: PlayTabSwitcherProps) => (
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
