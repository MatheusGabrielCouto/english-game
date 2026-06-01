import { create } from 'zustand';

import type { FarmDailyStats, FarmSessionRecord } from '@/types/farm';

type FarmState = {
  recentSessions: FarmSessionRecord[];
  todayStats: FarmDailyStats[];
  todayStudyPoints: number;
  isLoading: boolean;
  /** Epoch ms when manual farm actions are allowed again. */
  manualCooldownEndsAt: number | null;
};

export const useFarmStore = create<FarmState>()(() => ({
  recentSessions: [],
  todayStats: [],
  todayStudyPoints: 0,
  isLoading: true,
  manualCooldownEndsAt: null,
}));
