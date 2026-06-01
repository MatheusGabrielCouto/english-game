import { create } from 'zustand';

import type { WeeklyMission } from '@/types/weekly-mission';

import { WeeklyMissionService } from '../services/weekly-mission-service';

type WeeklyMissionsState = {
  missions: WeeklyMission[];
  weekStartDate: string;
  isLoading: boolean;
  claimingMissionId: string | null;
  claimMessage: string | null;
  completedFlashId: string | null;
  init: () => () => void;
  refresh: () => Promise<void>;
  claim: (id: string) => Promise<boolean>;
  clearClaimMessage: () => void;
  clearCompletedFlash: () => void;
};

export const useWeeklyMissionsStore = create<WeeklyMissionsState>((set, get) => ({
  missions: [],
  weekStartDate: '',
  isLoading: true,
  claimingMissionId: null,
  claimMessage: null,
  completedFlashId: null,

  init: () => {
    const unsubscribe = WeeklyMissionService.subscribe((missions, weekStartDate) => {
      const prev = get().missions;
      const newlyCompleted = missions.find(
        (m) =>
          m.completed &&
          !m.claimed &&
          prev.find((p) => p.id === m.id && !p.completed),
      );

      set({
        missions,
        weekStartDate,
        isLoading: false,
        completedFlashId: newlyCompleted?.id ?? get().completedFlashId,
      });
    });

    return unsubscribe;
  },

  refresh: async () => {
    set({ isLoading: true });
    await WeeklyMissionService.getCurrentWeekMissions();
    set({ isLoading: false });
  },

  claim: async (id) => {
    if (get().claimingMissionId) return false;

    set({ claimingMissionId: id });
    try {
      const mission = get().missions.find((m) => m.id === id);
      const success = await WeeklyMissionService.claimReward(id);

      if (success && mission) {
        set({
          claimMessage: `+${mission.xpReward} XP e +${mission.coinReward} moedas resgatadas!`,
        });
      }

      return success;
    } finally {
      set({ claimingMissionId: null });
    }
  },

  clearClaimMessage: () => set({ claimMessage: null }),

  clearCompletedFlash: () => set({ completedFlashId: null }),
}));
