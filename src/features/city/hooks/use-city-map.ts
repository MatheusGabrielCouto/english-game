import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { usePlayerStore } from '@/features/player';
import { shouldSkipHydratedStoreReread } from '@/storage/startup-read-policy';

import { CityMapService } from '../services/city-map-service';
import { useCityMapStore } from '../store/city-map-store';

export const useCityMap = () => {
  const level = usePlayerStore((state) => state.level);
  const {
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
    selectedPoiKey,
    activeTab,
    isLoading,
    setSelectedPoiKey,
    setActiveTab,
  } = useCityMapStore(
    useShallow((state) => ({
      districts: state.districts,
      pois: state.pois,
      summary: state.summary,
      claimablePoiKeys: state.claimablePoiKeys,
      activeContractIssuerPoiKey: state.activeContractIssuerPoiKey,
      resourceBalances: state.resourceBalances,
      activeRumor: state.activeRumor,
      vitalityBand: state.vitalityBand,
      petVisitedParkToday: state.petVisitedParkToday,
      activeCityEvent: state.activeCityEvent,
      selectedPoiKey: state.selectedPoiKey,
      activeTab: state.activeTab,
      isLoading: state.isLoading,
      setSelectedPoiKey: state.setSelectedPoiKey,
      setActiveTab: state.setActiveTab,
    })),
  );
  const previousLevel = useRef(level);

  useEffect(() => {
    if (pois.length === 0) {
      if (!shouldSkipHydratedStoreReread(!isLoading)) {
        void CityMapService.refresh();
      }
      previousLevel.current = level;
      return;
    }

    if (previousLevel.current === level) return;

    previousLevel.current = level;
    void CityMapService.syncForPlayerLevel(level);
  }, [isLoading, pois.length, level]);

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
