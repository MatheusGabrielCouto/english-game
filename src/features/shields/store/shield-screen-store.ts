import { create } from 'zustand';

import type { ShieldFeedback } from '../services/shield-service';

type ShieldScreenState = {
  isLoading: boolean;
  isRefreshing: boolean;
  feedback: ShieldFeedback | null;
  setLoading: (value: boolean) => void;
  setRefreshing: (value: boolean) => void;
  setFeedback: (feedback: ShieldFeedback | null) => void;
  clearFeedback: () => void;
};

export const useShieldScreenStore = create<ShieldScreenState>((set) => ({
  isLoading: true,
  isRefreshing: false,
  feedback: null,

  setLoading: (value) => set({ isLoading: value }),
  setRefreshing: (value) => set({ isRefreshing: value }),
  setFeedback: (feedback) => set({ feedback }),
  clearFeedback: () => set({ feedback: null }),
}));
