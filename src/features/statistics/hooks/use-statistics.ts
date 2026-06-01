import { useCallback, useEffect } from 'react';

import { StatisticsService } from '../services/statistics-service';
import { useStatisticsStore } from '../store/statistics-store';

export const useStatistics = () => {
  const dashboard = useStatisticsStore((state) => state.dashboard);
  const isLoading = useStatisticsStore((state) => state.isLoading);

  useEffect(() => {
    void StatisticsService.refresh();
  }, []);

  const handleRefresh = useCallback(async () => {
    await StatisticsService.refresh();
  }, []);

  return {
    dashboard,
    isLoading,
    handleRefresh,
  };
};

export type UseStatisticsReturn = ReturnType<typeof useStatistics>;
