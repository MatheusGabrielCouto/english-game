import { create } from 'zustand';

import type {
  FocusAnalytics,
  FocusLiveSessionState,
  FocusSession,
  FocusSessionRewards,
  FocusSettings,
} from '@/types/focus-mode';

type FocusModeStore = {
  settings: FocusSettings | null;
  analytics: FocusAnalytics | null;
  activeSession: FocusSession | null;
  liveSession: FocusLiveSessionState | null;
  lastRewards: FocusSessionRewards | null;
  isLoading: boolean;
};

export const useFocusModeStore = create<FocusModeStore>()(() => ({
  settings: null,
  analytics: null,
  activeSession: null,
  liveSession: null,
  lastRewards: null,
  isLoading: true,
}));
