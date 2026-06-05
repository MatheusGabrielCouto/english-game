import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CityDistrictViewModel, CityPoiViewModel } from '@/types/city-map';

import type { CityMapScrollViewport } from '../constants/city-map-viewport-ui';
import {
    computeDistrictZones,
    computeMapGridLayout,
    DISTRICT_ZONE_COLORS,
    getPoiPinPosition,
    type DistrictZoneBounds,
    type MapGridLayout,
} from '../constants/city-map-grid';
import {
    filterPoiPlacementsInViewport,
    filterRectsInViewport,
} from '../utils/city-map-viewport-culling';
import {
    CITY_MAP_GMAPS,
    CITY_MAP_THEME_LAND,
    STREET_LABELS_H,
    STREET_LABELS_V,
} from '../constants/city-map-styles';
import { CityMapBlock } from './CityMapBlock';
import { CityPoiPin } from './CityPoiPin';

type CityMapGridProps = {
  mapWidth: number;
  mapHeight: number;
  viewportBounds?: CityMapScrollViewport | null;
  districts: CityDistrictViewModel[];
  pois: CityPoiViewModel[];
  claimablePoiKeys: string[];
  activeContractIssuerPoiKey: string | null;
  petVisitedParkToday: boolean;
  mapThemeKey?: string | null;
  eventPoiKeys?: string[];
  eventEmoji?: string | null;
  onPoiPress: (poiKey: string) => void;
};

const ARTERIAL_STREET_INDICES_H = new Set([1, 3]);

const DistrictZoneFill = ({
  zone,
  unlocked,
}: {
  zone: DistrictZoneBounds;
  unlocked: boolean;
}) => {
  if (zone.width <= 0 || zone.height <= 0) return null;

  const colors = DISTRICT_ZONE_COLORS[zone.districtKey] ?? {
    border: `${CITY_MAP_GMAPS.districtLabelBorder}66`,
    fill: 'transparent',
    labelBg: CITY_MAP_GMAPS.districtLabelBg,
    labelText: CITY_MAP_GMAPS.districtLabelText,
  };

  return (
    <View
      style={[
        styles.districtZone,
        {
          left: zone.left,
          top: zone.top,
          width: zone.width,
          height: zone.height,
          borderColor: unlocked ? colors.border : `${CITY_MAP_GMAPS.roadLabel}33`,
          backgroundColor: unlocked ? colors.fill : CITY_MAP_GMAPS.districtLockedOverlay,
        },
      ]}
      pointerEvents="none"
    />
  );
};

const DistrictZoneLabel = ({
  zone,
  unlocked,
  requiredLevel,
}: {
  zone: DistrictZoneBounds;
  unlocked: boolean;
  requiredLevel: number;
}) => {
  if (zone.width <= 0 || zone.height <= 0) return null;

  const colors = DISTRICT_ZONE_COLORS[zone.districtKey] ?? {
    border: `${CITY_MAP_GMAPS.districtLabelBorder}66`,
    fill: 'transparent',
    labelBg: CITY_MAP_GMAPS.districtLabelBg,
    labelText: CITY_MAP_GMAPS.districtLabelText,
  };

  return (
    <View
      style={[
        styles.districtLabelWrap,
        { left: zone.left + 10, top: zone.top + 8 },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.districtLabel,
          {
            backgroundColor: colors.labelBg,
            borderColor: CITY_MAP_GMAPS.districtLabelBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.districtLabelText,
            { color: unlocked ? colors.labelText : CITY_MAP_GMAPS.roadLabel },
          ]}
        >
          {zone.name}
          {!unlocked ? ` · Nv.${requiredLevel}` : ''}
        </Text>
      </View>
    </View>
  );
};

const StreetMarkings = ({ layout }: { layout: MapGridLayout }) => (
  <>
    {layout.horizontalStreets.map((street, index) => {
      const isArterial = ARTERIAL_STREET_INDICES_H.has(index);
      const label = STREET_LABELS_H[index];

      return (
        <View
          key={`h-${index}`}
          style={[
            styles.street,
            isArterial ? styles.streetArterial : styles.streetLocal,
            {
              left: street.left,
              top: street.top,
              width: street.width,
              height: street.height,
            },
          ]}
        >
          <View style={[styles.streetEdge, isArterial && styles.streetEdgeArterial]} />
          {label ? (
            <Text style={styles.streetLabel} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      );
    })}
    {layout.verticalStreets.map((street, index) => {
      const label = STREET_LABELS_V[index];

      return (
        <View
          key={`v-${index}`}
          style={[
            styles.street,
            styles.streetLocal,
            {
              left: street.left,
              top: street.top,
              width: street.width,
              height: street.height,
            },
          ]}
        >
          <View style={styles.streetEdgeV} />
          {label ? (
            <Text style={[styles.streetLabel, styles.streetLabelVertical]} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      );
    })}
  </>
);

export const CityMapGrid = ({
  mapWidth,
  mapHeight,
  viewportBounds = null,
  districts,
  pois,
  claimablePoiKeys,
  activeContractIssuerPoiKey,
  petVisitedParkToday,
  mapThemeKey,
  eventPoiKeys = [],
  eventEmoji = null,
  onPoiPress,
}: CityMapGridProps) => {
  const claimableSet = useMemo(() => new Set(claimablePoiKeys), [claimablePoiKeys]);
  const eventPoiSet = useMemo(() => new Set(eventPoiKeys), [eventPoiKeys]);
  const layout = useMemo(
    () => computeMapGridLayout(mapWidth, mapHeight),
    [mapWidth, mapHeight],
  );

  const districtZones = useMemo(
    () =>
      computeDistrictZones(
        layout,
        districts.map((d) => ({
          districtKey: d.districtKey,
          name: d.name,
          mapEmoji: d.mapEmoji,
        })),
      ),
    [layout, districts],
  );

  const districtUnlocked = (districtKey: string) =>
    districts.find((d) => d.districtKey === districtKey)?.isUnlocked ?? false;

  const visibleBlocks = useMemo(() => {
    if (!viewportBounds) return layout.blocks;
    return filterRectsInViewport(layout.blocks, viewportBounds, mapWidth, mapHeight);
  }, [layout.blocks, mapHeight, mapWidth, viewportBounds]);

  const visibleHorizontalStreets = useMemo(() => {
    if (!viewportBounds) return layout.horizontalStreets;
    return filterRectsInViewport(layout.horizontalStreets, viewportBounds, mapWidth, mapHeight);
  }, [layout.horizontalStreets, mapHeight, mapWidth, viewportBounds]);

  const visibleVerticalStreets = useMemo(() => {
    if (!viewportBounds) return layout.verticalStreets;
    return filterRectsInViewport(layout.verticalStreets, viewportBounds, mapWidth, mapHeight);
  }, [layout.verticalStreets, mapHeight, mapWidth, viewportBounds]);

  const visibleDistrictZones = useMemo(() => {
    if (!viewportBounds) return districtZones;
    return filterRectsInViewport(districtZones, viewportBounds, mapWidth, mapHeight);
  }, [districtZones, mapHeight, mapWidth, viewportBounds]);

  const visiblePoiPlacements = useMemo(() => {
    const placements = pois.map((poi) => {
      const position = getPoiPinPosition(poi.poiKey, layout, poi.positionX, poi.positionY);
      return { poi, ...position };
    });

    if (!viewportBounds) return placements;
    return filterPoiPlacementsInViewport(placements, viewportBounds, mapWidth, mapHeight);
  }, [layout, mapHeight, mapWidth, pois, viewportBounds]);

  const visibleStreetLayout = useMemo(
    () => ({
      ...layout,
      horizontalStreets: visibleHorizontalStreets,
      verticalStreets: visibleVerticalStreets,
    }),
    [layout, visibleHorizontalStreets, visibleVerticalStreets],
  );

  const landColor =
    (mapThemeKey && CITY_MAP_THEME_LAND[mapThemeKey]) ?? CITY_MAP_GMAPS.land;

  return (
    <View style={[styles.canvas, { width: mapWidth, height: mapHeight, backgroundColor: landColor }]}>
      {visibleDistrictZones.map((zone) => {
        const district = districts.find((d) => d.districtKey === zone.districtKey);
        return (
          <DistrictZoneFill
            key={`fill-${zone.districtKey}`}
            zone={zone}
            unlocked={district?.isUnlocked ?? false}
          />
        );
      })}

      {visibleBlocks.map((block) => (
        <CityMapBlock
          key={`${block.row}-${block.col}`}
          block={block}
          dimmed={!districtUnlocked(block.districtKey)}
        />
      ))}

      <StreetMarkings layout={visibleStreetLayout} />

      {visibleDistrictZones.map((zone) => {
        const district = districts.find((d) => d.districtKey === zone.districtKey);
        return (
          <DistrictZoneLabel
            key={`label-${zone.districtKey}`}
            zone={zone}
            unlocked={district?.isUnlocked ?? false}
            requiredLevel={district?.requiredPlayerLevel ?? 1}
          />
        );
      })}

      {visiblePoiPlacements.map(({ poi, left, top }) => (
        <CityPoiPin
          key={poi.poiKey}
          poi={poi}
          left={left}
          top={top}
          hasClaimableMission={claimableSet.has(poi.poiKey)}
          isActiveContractIssuer={activeContractIssuerPoiKey === poi.poiKey}
          petAtParkToday={poi.poiKey === 'city_park' && petVisitedParkToday}
          isEventPoi={eventPoiSet.has(poi.poiKey)}
          eventEmoji={eventPoiSet.has(poi.poiKey) ? eventEmoji : null}
          onPress={() => onPoiPress(poi.poiKey)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
  },
  districtZone: {
    position: 'absolute',
    zIndex: 1,
    borderWidth: 1,
    borderRadius: 12,
  },
  districtLabelWrap: {
    position: 'absolute',
    zIndex: 8,
  },
  districtLabel: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    shadowColor: CITY_MAP_GMAPS.markerLabelShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  districtLabelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  street: {
    position: 'absolute',
    zIndex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  streetLocal: {
    backgroundColor: CITY_MAP_GMAPS.road,
    borderWidth: 0.5,
    borderColor: CITY_MAP_GMAPS.roadBorder,
  },
  streetArterial: {
    backgroundColor: CITY_MAP_GMAPS.roadArterial,
    borderWidth: 0.5,
    borderColor: CITY_MAP_GMAPS.roadArterialBorder,
  },
  streetEdge: {
    width: '88%',
    height: 2,
    backgroundColor: CITY_MAP_GMAPS.roadBorder,
    opacity: 0.35,
    borderRadius: 1,
  },
  streetEdgeArterial: {
    backgroundColor: '#c9a227',
    opacity: 0.5,
  },
  streetEdgeV: {
    width: 2,
    height: '88%',
    backgroundColor: CITY_MAP_GMAPS.roadBorder,
    opacity: 0.35,
    borderRadius: 1,
  },
  streetLabel: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: '600',
    color: CITY_MAP_GMAPS.roadLabel,
    backgroundColor: 'rgba(30, 34, 44, 0.88)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    maxWidth: 120,
  },
  streetLabelVertical: {
    transform: [{ rotate: '-90deg' }],
  },
});
