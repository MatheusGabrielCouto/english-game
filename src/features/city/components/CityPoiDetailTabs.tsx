import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TOUCH_TARGET_CHIP_CLASS } from '@/constants/touch-target-ui';
import { cn } from '@/utils';

import { CityPoiProjectService } from '../services/city-poi-project-service';

export type CityPoiDetailTab = 'overview' | 'missions' | 'contracts' | 'deliver' | 'event';

type CityPoiDetailTabsProps = {
  poiKey: string;
  activeTab: CityPoiDetailTab;
  onTabChange: (tab: CityPoiDetailTab) => void;
  hasClaimableMissions?: boolean;
  isContractIssuer?: boolean;
  showEventTab?: boolean;
  eventTabEmoji?: string;
  eventTabLabel?: string;
};

type TabDef = {
  key: CityPoiDetailTab;
  label: string;
  emoji: string;
  showBadge?: boolean;
};

const BASE_TABS: Omit<TabDef, 'showBadge'>[] = [
  { key: 'overview', label: 'Visão', emoji: '🏛️' },
  { key: 'missions', label: 'Missões', emoji: '📋' },
  { key: 'contracts', label: 'Contratos', emoji: '📜' },
  { key: 'deliver', label: 'Entregar', emoji: '🧱' },
];

const buildEventTab = (label: string, emoji: string): TabDef => ({
  key: 'event',
  label,
  emoji,
});

export const CityPoiDetailTabs = ({
  poiKey,
  activeTab,
  onTabChange,
  hasClaimableMissions = false,
  isContractIssuer = false,
  showEventTab = false,
  eventTabEmoji = '🎉',
  eventTabLabel = 'Evento',
}: CityPoiDetailTabsProps) => {
  const base = BASE_TABS.filter(
    (tab) => tab.key !== 'deliver' || CityPoiProjectService.supportsDelivery(poiKey),
  );
  const withEvent = showEventTab
    ? [...base, buildEventTab(eventTabLabel, eventTabEmoji)]
    : base;

  const tabs: TabDef[] = withEvent.map((tab) => ({
    ...tab,
    showBadge:
      (tab.key === 'missions' && hasClaimableMissions) ||
      (tab.key === 'contracts' && isContractIssuer),
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabRow}
      accessibilityRole="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            className={cn(
              'min-w-[88px] flex-row gap-1.5 rounded-xl border px-3',
              TOUCH_TARGET_CHIP_CLASS,
              isActive ? 'border-primary bg-primary' : 'border-border bg-surface',
            )}>
            <Text className="">{tab.emoji}</Text>
            <Text
              className={cn(
                'text-xs font-bold',
                isActive ? 'text-primary-foreground' : 'text-foreground-secondary',
              )}>
              {tab.label}
            </Text>
            {tab.showBadge ? (
              <View
                className={cn(
                  'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full',
                  isActive ? 'bg-gold' : 'bg-warning',
                )}
                accessibilityElementsHidden
              />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
});
