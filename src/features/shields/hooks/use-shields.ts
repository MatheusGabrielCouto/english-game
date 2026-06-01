import { useCallback, useEffect } from 'react';

import { usePlayerStore } from '@/features/player';

import { ShieldService } from '../services/shield-service';
import { useShieldScreenStore } from '../store/shield-screen-store';

export const useShields = () => {
  const shields = usePlayerStore((s) => s.shields);
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const isLoading = useShieldScreenStore((s) => s.isLoading);
  const isRefreshing = useShieldScreenStore((s) => s.isRefreshing);
  const feedback = useShieldScreenStore((s) => s.feedback);
  const setLoading = useShieldScreenStore((s) => s.setLoading);
  const setRefreshing = useShieldScreenStore((s) => s.setRefreshing);
  const setFeedback = useShieldScreenStore((s) => s.setFeedback);
  const clearFeedback = useShieldScreenStore((s) => s.clearFeedback);

  const refresh = useCallback(async () => {
    setRefreshing(true);

    const startupFeedback = ShieldService.getLastFeedback();
    if (startupFeedback) {
      setFeedback(startupFeedback);
      ShieldService.clearFeedback();
    }

    setRefreshing(false);
    setLoading(false);
  }, [setFeedback, setLoading, setRefreshing]);

  useEffect(() => {
    void refresh();
  }, [refresh, shields, currentStreak]);

  return {
    shields,
    currentStreak,
    isLoading,
    isRefreshing,
    feedback,
    refresh,
    clearFeedback,
    getUsageHistory: ShieldService.getUsageHistory,
    getStats: ShieldService.getStats,
  };
};
