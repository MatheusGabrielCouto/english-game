import { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants';
import type { ActiveCityEventViewModel } from '@/types/city-event';
import type { CityDistrictViewModel, CityMapSummary, CityPoiViewModel } from '@/types/city-map';
import type { CityResourceBalances } from '@/types/city-resource';

import { CITY_UI } from '../constants/city-ui';
import { CITY_MAP_HEIGHT } from '../constants/map-layout';
import { CityMapHeader } from './CityMapHeader';
import { CityMapViewport } from './CityMapViewport';

type CityMapViewProps = {
  summary: CityMapSummary;
  districts: CityDistrictViewModel[];
  pois: CityPoiViewModel[];
  claimablePoiKeys: string[];
  activeContractIssuerPoiKey: string | null;
  resourceBalances: CityResourceBalances | null;
  petVisitedParkToday: boolean;
  activeCityEvent?: ActiveCityEventViewModel | null;
  onPoiPress: (poiKey: string) => void;
};

export const CityMapView = ({
  summary,
  districts,
  pois,
  claimablePoiKeys,
  activeContractIssuerPoiKey,
  resourceBalances,
  petVisitedParkToday,
  activeCityEvent = null,
  onPoiPress,
}: CityMapViewProps) => {
  const [mapWidth, setMapWidth] = useState(0);

  const handleMapLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) setMapWidth(width);
  }, []);

  const mapReady = mapWidth > 0;
  return (
    <View className="gap-4">
      <CityMapHeader summary={summary} resourceBalances={resourceBalances} />

      <View className="flex-row flex-wrap gap-2">
        {districts.map((district) => (
          <View
            key={district.districtKey}
            style={[
              styles.districtChip,
              district.isUnlocked ? styles.districtChipActive : styles.districtChipLocked,
            ]}
          >
            <Text
              style={[
                styles.districtChipText,
                !district.isUnlocked && styles.districtChipTextMuted,
              ]}
            >
              {district.mapEmoji} {district.name}
              {!district.isUnlocked && district.isLockedByLevel
                ? ` · Nv.${district.requiredPlayerLevel}`
                : ''}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.mapFrame}>
        <View style={styles.mapLayoutWrap} onLayout={handleMapLayout}>
          {mapReady ? (
            <CityMapViewport
              mapWidth={mapWidth}
              mapHeight={CITY_MAP_HEIGHT}
              districts={districts}
              pois={pois}
              claimablePoiKeys={claimablePoiKeys}
              activeContractIssuerPoiKey={activeContractIssuerPoiKey}
              petVisitedParkToday={petVisitedParkToday}
              mapThemeKey={activeCityEvent?.mapThemeKey ?? null}
              eventPoiKeys={activeCityEvent?.participatingPoiKeys}
              eventEmoji={activeCityEvent?.emoji ?? null}
              onPoiPress={onPoiPress}
            />
          ) : (
            <View style={styles.mapPlaceholder} />
          )}
        </View>
      </View>

      {pois.length === 0 ? (
        <Text className="text-center text-sm text-warning">{CITY_UI.mapEmptyPois}</Text>
      ) : null}

      <Text className="text-center text-xs text-muted">
        {CITY_UI.mapHintGmaps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  districtChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  districtChipActive: {
    borderColor: `${theme.colors.primary}66`,
    backgroundColor: `${theme.colors.primary}22`,
  },
  districtChipLocked: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  districtChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.foreground,
  },
  districtChipTextMuted: {
    color: theme.colors.muted,
  },
  mapFrame: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    backgroundColor: '#151820',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  mapLayoutWrap: {
    width: '100%',
    minHeight: CITY_MAP_HEIGHT,
  },
  mapPlaceholder: {
    width: '100%',
    height: CITY_MAP_HEIGHT,
    backgroundColor: '#151820',
  },
});
