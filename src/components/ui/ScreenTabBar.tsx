import { Pressable, Text, View } from 'react-native'

import {
  SCREEN_TAB_LABEL_ACTIVE_CLASS,
  SCREEN_TAB_LABEL_INACTIVE_CLASS,
  SCREEN_TAB_LIST_CLASS,
  SCREEN_TAB_PRESSABLE_ACTIVE_CLASS,
  SCREEN_TAB_PRESSABLE_CLASS,
} from '@/constants/touch-target-ui'
import { cn } from '@/utils'

export type ScreenTabBarItem<T extends string> = {
  id: T
  label: string
  badge?: number
}

type ScreenTabBarProps<T extends string> = {
  tabs: ScreenTabBarItem<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
  className?: string
}

export const ScreenTabBar = <T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: ScreenTabBarProps<T>) => (
  <View className={cn(SCREEN_TAB_LIST_CLASS, className)} accessibilityRole="tablist">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id
      const badge = tab.badge

      return (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={
            badge && badge > 0
              ? `${tab.label}, ${badge} pendente${badge > 1 ? 's' : ''}`
              : tab.label
          }
          className={cn(SCREEN_TAB_PRESSABLE_CLASS, isActive && SCREEN_TAB_PRESSABLE_ACTIVE_CLASS)}>
          <Text
            className={cn(
              'text-center text-sm font-semibold',
              isActive ? SCREEN_TAB_LABEL_ACTIVE_CLASS : SCREEN_TAB_LABEL_INACTIVE_CLASS,
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
