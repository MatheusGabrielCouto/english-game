import { Pressable, Text, View } from 'react-native'

import { cn } from '@/utils'

import { PROFILE_UI, type ProfileTab } from '../constants/profile-ui'

type ProfileTabSwitcherProps = {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'identity', label: PROFILE_UI.tabs.identity },
  { id: 'settings', label: PROFILE_UI.tabs.settings },
]

export const ProfileTabSwitcher = ({ activeTab, onTabChange }: ProfileTabSwitcherProps) => (
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
