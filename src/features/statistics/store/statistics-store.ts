import { create } from 'zustand';

import type { StatisticsDashboard } from '@/types/statistics';

type StatisticsStoreState = {
  dashboard: StatisticsDashboard | null;
  isLoading: boolean;
};

export const useStatisticsStore = create<StatisticsStoreState>(() => ({
  dashboard: null,
  isLoading: true,
}));
