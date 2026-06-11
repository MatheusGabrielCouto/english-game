import { create } from 'zustand';

import { shouldSkipHydratedStoreReread } from '@/storage/startup-read-policy';
import type { RoutineTodayItem, UserRoutineRecord } from '@/types/routine';

type RefreshRoutinesOptions = {
  force?: boolean;
};

type RoutinesState = {
  todayItems: RoutineTodayItem[];
  dueToday: RoutineTodayItem[];
  completedToday: RoutineTodayItem[];
  pendingToday: RoutineTodayItem[];
  allRoutines: UserRoutineRecord[];
  isLoading: boolean;
  refresh: (options?: RefreshRoutinesOptions) => Promise<void>;
};

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  todayItems: [],
  dueToday: [],
  completedToday: [],
  pendingToday: [],
  allRoutines: [],
  isLoading: true,

  refresh: async (options) => {
    const state = get();
    if (
      !options?.force &&
      shouldSkipHydratedStoreReread(!state.isLoading, { withinFocusGrace: true })
    ) {
      return;
    }

    if (!state.isLoading) {
      set({ isLoading: true });
    }

    const { RoutineService } = await import('../services/routine-service');
    await RoutineService.refresh();
    set({ isLoading: false });
  },
}));
