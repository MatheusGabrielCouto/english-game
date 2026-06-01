import { create } from 'zustand';

import type {
    TitleAnalyticsRecord,
    TitleProgress,
    TitleSummary,
    TitleUnlockPayload,
    TitleViewModel,
} from '@/types/title';

type TitlesState = {
  titles: TitleViewModel[];
  summary: TitleSummary;
  progress: TitleProgress | null;
  analytics: TitleAnalyticsRecord | null;
  celebration: TitleUnlockPayload | null;
  isLoading: boolean;
};

export const useTitlesStore = create<TitlesState>()(() => ({
  titles: [],
  summary: { unlocked: 0, total: 0, currentTitleKey: 'local_developer' },
  progress: null,
  analytics: null,
  celebration: null,
  isLoading: true,
}));
