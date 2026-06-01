import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/features/player';

import { CityMapService } from '../services/city-map-service';
import { useCityMapStore } from '../store/city-map-store';

export const useCityMap = () => {
  const level = usePlayerStore((state) => state.level);
  const districts = useCityMapStore((state) => state.districts);
  const pois = useCityMapStore((state) => state.pois);
  const summary = useCityMapStore((state) => state.summary);
  const claimablePoiKeys = useCityMapStore((state) => state.claimablePoiKeys);
  const activeContractIssuerPoiKey = useCityMapStore((state) => state.activeContractIssuerPoiKey);
  const resourceBalances = useCityMapStore((state) => state.resourceBalances);
  const activeRumor = useCityMapStore((state) => state.activeRumor);
  const vitalityBand = useCityMapStore((state) => state.vitalityBand);
  const petVisitedParkToday = useCityMapStore((state) => state.petVisitedParkToday);
  const activeCityEvent = useCityMapStore((state) => state.activeCityEvent);
  const selectedPoiKey = useCityMapStore((state) => state.selectedPoiKey);
  const activeTab = useCityMapStore((state) => state.activeTab);
  const isLoading = useCityMapStore((state) => state.isLoading);
  const setSelectedPoiKey = useCityMapStore((state) => state.setSelectedPoiKey);
  const setActiveTab = useCityMapStore((state) => state.setActiveTab);
  const previousLevel = useRef(level);

  useEffect(() => {
    if (pois.length === 0) {
      void CityMapService.refresh();
      previousLevel.current = level;
      return;
    }

    if (previousLevel.current === level) return;

    previousLevel.current = level;
    void CityMapService.syncForPlayerLevel(level);
  }, [pois.length, level]);

  const selectedPoi = selectedPoiKey
    ? pois.find((poi) => poi.poiKey === selectedPoiKey) ?? null
    : null;

  return {
    level,
    districts,
    pois,
    summary,
    claimablePoiKeys,
    activeContractIssuerPoiKey,
    resourceBalances,
    activeRumor,
    vitalityBand,
    petVisitedParkToday,
    activeCityEvent,
    selectedPoi,
    selectedPoiKey,
    activeTab,
    isLoading,
    setSelectedPoiKey,
    setActiveTab,
    visitPoi: CityMapService.visitPoi,
  };
};
