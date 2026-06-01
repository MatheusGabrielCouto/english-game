import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { CITY_UI } from '../constants/city-ui';
import { useCityMap } from '../hooks/use-city-map';
import { CityMapTabContent } from './CityMapTabContent';
import type { CityPoiDetailTab } from './CityPoiDetailTabs';
import { CityScreenContent } from './CityScreenContent';
import { CityTabSwitcher } from './CityTabSwitcher';

export const CityScreen = () => {
  const { poiKey, tab } = useLocalSearchParams<{ poiKey?: string; tab?: string }>();
  const { activeTab, setActiveTab, setSelectedPoiKey, pois, isLoading } = useCityMap();

  useEffect(() => {
    if (!poiKey || isLoading || pois.length === 0) return;

    const poi = pois.find((p) => p.poiKey === poiKey);
    if (!poi?.isUnlocked) return;

    setActiveTab('map');
    setSelectedPoiKey(poiKey);
  }, [poiKey, pois, isLoading, setActiveTab, setSelectedPoiKey]);

  const poiDetailTab: CityPoiDetailTab | undefined =
    tab === 'contracts'
      ? 'contracts'
      : tab === 'missions'
        ? 'missions'
        : tab === 'deliver'
          ? 'deliver'
          : tab === 'event'
            ? 'event'
            : undefined;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={CITY_UI.screenTitle}
        subtitle={CITY_UI.screenSubtitle}
        emoji="🗺️"
      />
      <View className="gap-5 pt-2">
        <CityTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'map' ? (
          <CityMapTabContent poiDetailInitialTab={poiDetailTab} />
        ) : (
          <CityScreenContent />
        )}
      </View>
    </ScreenContainer>
  );
};
