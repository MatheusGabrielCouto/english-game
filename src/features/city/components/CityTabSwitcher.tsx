import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

import { CITY_UI } from '../constants/city-ui';

type CityTab = 'map' | 'summary';

type CityTabSwitcherProps = {
  activeTab: CityTab;
  onTabChange: (tab: CityTab) => void;
};

export const CityTabSwitcher = ({ activeTab, onTabChange }: CityTabSwitcherProps) => (
  <View
    className="flex-row rounded-2xl border border-border bg-surface p-1"
    accessibilityRole="tablist"
  >
    {(
      [
        { id: 'map' as const, label: CITY_UI.tabMap },
        { id: 'summary' as const, label: CITY_UI.tabSummary },
      ] as const
    ).map((tab) => {
      const isActive = activeTab === tab.id;

      return (
        <Pressable
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={tab.label}
          className={cn('flex-1 rounded-xl py-2.5', isActive && 'bg-primary')}
        >
          <Text
            className={cn(
              'text-center text-sm font-semibold',
              isActive ? 'text-primary-foreground' : 'text-foreground-secondary',
            )}
          >
            {tab.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);
