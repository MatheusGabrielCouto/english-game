import { create } from 'zustand';

import type { StatisticsDashboard } from '@/types/statistics';

type StatisticsStoreState = {
  dashboard: StatisticsDashboard | null;
  isLoading: boolean;
  isRefreshing: boolean;
  setRefreshing: (value: boolean) => void;
};

export const useStatisticsStore = create<StatisticsStoreState>((set) => ({
  dashboard: null,
  isLoading: true,
  isRefreshing: false,
  setRefreshing: (value) => set({ isRefreshing: value }),
}));
