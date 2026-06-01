import { useCallback, useEffect, useState } from 'react';

import { usePlayerStore } from '@/features/player';

import { StreakService } from '../services/streak-service';

export const useStudyHistory = () => {
  const lastStudyDate = usePlayerStore((s) => s.lastStudyDate);
  const [recentDays, setRecentDays] = useState<string[]>([]);
  const [monthStudyDays, setMonthStudyDays] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async (year: number, month: number) => {
    setIsLoading(true);

    const [recent, monthDays] = await Promise.all([
      StreakService.getRecentStudyDays(14),
      StreakService.getStudyDaysInMonth(year, month),
    ]);

    setRecentDays(recent);
    setMonthStudyDays(monthDays);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const now = new Date();
    void loadHistory(now.getFullYear(), now.getMonth() + 1);
  }, [lastStudyDate, loadHistory]);

  return {
    recentDays,
    monthStudyDays,
    isLoading,
    loadHistory,
  };
};
