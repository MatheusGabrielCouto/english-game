import { create } from 'zustand';

import type { StudyPointsBalance, StudyPointsTransaction } from '@/types/study-points';

type StudyPointsState = {
  balance: StudyPointsBalance | null;
  history: StudyPointsTransaction[];
  isLoading: boolean;
};

export const useStudyPointsStore = create<StudyPointsState>()(() => ({
  balance: null,
  history: [],
  isLoading: true,
}));
