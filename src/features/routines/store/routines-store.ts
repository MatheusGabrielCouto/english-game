import { create } from 'zustand';

import type { RoutineTodayItem, UserRoutineRecord } from '@/types/routine';

type RoutinesState = {
  todayItems: RoutineTodayItem[];
  dueToday: RoutineTodayItem[];
  completedToday: RoutineTodayItem[];
  pendingToday: RoutineTodayItem[];
  allRoutines: UserRoutineRecord[];
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export const useRoutinesStore = create<RoutinesState>((set) => ({
  todayItems: [],
  dueToday: [],
  completedToday: [],
  pendingToday: [],
  allRoutines: [],
  isLoading: true,

  refresh: async () => {
    set({ isLoading: true });
    const { RoutineService } = await import('../services/routine-service');
    await RoutineService.refresh();
    set({ isLoading: false });
  },
}));
