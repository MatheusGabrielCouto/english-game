import { create } from 'zustand';

import type {
  AchievementAnalyticsRecord,
  AchievementSummary,
  AchievementUnlockPayload,
  AchievementViewModel,
} from '@/types/achievement';

type AchievementsState = {
  achievements: AchievementViewModel[];
  summary: AchievementSummary;
  analytics: AchievementAnalyticsRecord | null;
  celebration: AchievementUnlockPayload | null;
  isLoading: boolean;
};

export const useAchievementsStore = create<AchievementsState>()(() => ({
  achievements: [],
  summary: { unlocked: 0, total: 0, percentage: 0 },
  analytics: null,
  celebration: null,
  isLoading: true,
}));
