import { create } from 'zustand';

import type {
  CityAnalyticsRecord,
  CityBuildingViewModel,
  CityProgress,
  CitySummary,
  CityUnlockPayload,
} from '@/types/city';

type CityState = {
  buildings: CityBuildingViewModel[];
  summary: CitySummary;
  progress: CityProgress | null;
  analytics: CityAnalyticsRecord | null;
  celebration: CityUnlockPayload | null;
  isLoading: boolean;
};

export const useCityStore = create<CityState>()(() => ({
  buildings: [],
  summary: { unlocked: 0, total: 0, currentBuildingKey: 'house' },
  progress: null,
  analytics: null,
  celebration: null,
  isLoading: true,
}));
