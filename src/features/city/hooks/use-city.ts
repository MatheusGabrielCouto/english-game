import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/features/player';

import { CityService } from '../services/city-service';
import { useCityStore } from '../store/city-store';

export const useCity = () => {
  const level = usePlayerStore((state) => state.level);
  const buildings = useCityStore((state) => state.buildings);
  const summary = useCityStore((state) => state.summary);
  const progress = useCityStore((state) => state.progress);
  const analytics = useCityStore((state) => state.analytics);
  const isLoading = useCityStore((state) => state.isLoading);
  const previousLevel = useRef(level);

  useEffect(() => {
    if (buildings.length === 0) {
      void CityService.refresh();
      previousLevel.current = level;
      return;
    }

    if (previousLevel.current === level) return;

    previousLevel.current = level;
    void CityService.refresh();
  }, [buildings.length, level]);

  return {
    level,
    buildings,
    summary,
    progress,
    analytics,
    isLoading,
  };
};
