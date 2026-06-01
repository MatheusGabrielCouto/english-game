import { create } from 'zustand';

import type { EpicMissionViewModel } from '@/types/epic-mission';

type EpicQuestsStoreState = {
  missions: EpicMissionViewModel[];
  isLoading: boolean;
};

export const useEpicQuestsStore = create<EpicQuestsStoreState>(() => ({
  missions: [],
  isLoading: true,
}));
