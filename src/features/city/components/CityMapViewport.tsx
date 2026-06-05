import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import type { CityDistrictViewModel, CityPoiViewModel } from '@/types/city-map';

import type { CityMapScrollViewport } from '../constants/city-map-viewport-ui';
import { CITY_UI } from '../constants/city-ui';
import { CITY_MAP_CANVAS_SCALE } from '../constants/map-layout';
import { shouldCullCityMapViewport } from '../utils/city-map-viewport-culling';
import { CityMapGrid } from './CityMapGrid';

type CityMapViewportProps = {
  mapWidth: number;
  mapHeight: number;
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

const ZOOM_LEVELS = [1, 1.4, 1.85] as const;

export const CityMapViewport = ({
  mapWidth,
  mapHeight,
  districts,
  pois,
  claimablePoiKeys,
  activeContractIssuerPoiKey,
  petVisitedParkToday,
  mapThemeKey,
  eventPoiKeys,
  eventEmoji,
  onPoiPress,
}: CityMapViewportProps) => {
  const hScrollRef = useRef<ScrollView>(null);
  const vScrollRef = useRef<ScrollView>(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

  const canvasWidth = Math.round(mapWidth * CITY_MAP_CANVAS_SCALE * zoom);
  const canvasHeight = Math.round(mapHeight * CITY_MAP_CANVAS_SCALE * zoom);
  const cullViewport = shouldCullCityMapViewport(canvasWidth, canvasHeight, mapWidth, mapHeight);

  const scrollOffset = useMemo(
    () => ({
      x: Math.max(0, Math.round((canvasWidth - mapWidth) / 2)),
      y: Math.max(0, Math.round((canvasHeight - mapHeight) / 2)),
    }),
    [canvasWidth, canvasHeight, mapWidth, mapHeight],
  );

  const viewportBounds = useMemo<CityMapScrollViewport | null>(() => {
    if (!cullViewport) return null;

    return {
      x: scrollX,
      y: scrollY,
      width: mapWidth,
      height: mapHeight,
    };
  }, [cullViewport, mapHeight, mapWidth, scrollX, scrollY]);

  useEffect(() => {
    setScrollX(scrollOffset.x);
    setScrollY(scrollOffset.y);
    hScrollRef.current?.scrollTo({ x: scrollOffset.x, animated: true });
    vScrollRef.current?.scrollTo({ y: scrollOffset.y, animated: true });
  }, [scrollOffset.x, scrollOffset.y]);

  const handleHorizontalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  }, []);

  const handleVerticalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  }, []);

  const handleRecenter = useCallback(() => {
    setScrollX(scrollOffset.x);
    setScrollY(scrollOffset.y);
    hScrollRef.current?.scrollTo({ x: scrollOffset.x, animated: true });
    vScrollRef.current?.scrollTo({ y: scrollOffset.y, animated: true });
  }, [scrollOffset]);

  return (
    <View style={[styles.viewport, { width: mapWidth, height: mapHeight }]}>
      <ScrollView
        ref={hScrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        bounces
        scrollEventThrottle={16}
        onScroll={handleHorizontalScroll}
        style={styles.scrollOuter}
        contentContainerStyle={{ width: canvasWidth, height: mapHeight }}
        accessibilityLabel={CITY_UI.mapCanvasLabel}>
        <ScrollView
          ref={vScrollRef}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          bounces
          scrollEventThrottle={16}
          onScroll={handleVerticalScroll}
          style={{ width: canvasWidth, height: mapHeight }}
          contentContainerStyle={{ width: canvasWidth, height: canvasHeight }}>
          <CityMapGrid
            mapWidth={canvasWidth}
            mapHeight={canvasHeight}
            viewportBounds={viewportBounds}
            districts={districts}
            pois={pois}
            claimablePoiKeys={claimablePoiKeys}
            activeContractIssuerPoiKey={activeContractIssuerPoiKey}
            petVisitedParkToday={petVisitedParkToday}
            mapThemeKey={mapThemeKey}
            eventPoiKeys={eventPoiKeys}
            eventEmoji={eventEmoji}
            onPoiPress={onPoiPress}
          />
        </ScrollView>
      </ScrollView>

      <View style={styles.controls} pointerEvents="box-none">
        <Pressable
          onPress={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          accessibilityRole="button"
          accessibilityLabel="Aumentar zoom"
          style={[styles.controlBtn, zoomIndex >= ZOOM_LEVELS.length - 1 && styles.controlBtnDisabled]}>
          <Text style={styles.controlBtnText}>+</Text>
        </Pressable>
        <Pressable
          onPress={() => setZoomIndex((i) => Math.max(0, i - 1))}
          disabled={zoomIndex <= 0}
          accessibilityRole="button"
          accessibilityLabel="Diminuir zoom"
          style={[styles.controlBtn, zoomIndex <= 0 && styles.controlBtnDisabled]}>
          <Text style={styles.controlBtnText}>−</Text>
        </Pressable>
        <Pressable
          onPress={handleRecenter}
          accessibilityRole="button"
          accessibilityLabel="Centralizar mapa"
          style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>◎</Text>
        </Pressable>
      </View>

      <View style={styles.attribution} pointerEvents="none">
        <Text style={styles.attributionText}>Cidade Viva</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
    backgroundColor: '#151820',
  },
  scrollOuter: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    gap: 6,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1e222c',
    borderWidth: 1,
    borderColor: '#3c4048',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  controlBtnDisabled: {
    opacity: 0.45,
  },
  controlBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e8eaed',
    lineHeight: 20,
  },
  attribution: {
    position: 'absolute',
    left: 8,
    bottom: 6,
    backgroundColor: 'rgba(30, 34, 44, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3c4048',
  },
  attributionText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9aa0a8',
  },
});
