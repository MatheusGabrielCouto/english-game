import { create } from 'zustand';

import type {
  CareerDreamProgress,
  CareerEventRecord,
  CareerInterviewProgress,
  CareerJobOfferProgress,
  CareerJourneyProgress,
  CareerProgressRecord,
} from '@/types/career';

type CareerState = {
  progress: CareerProgressRecord | null;
  journey: CareerJourneyProgress | null;
  interviews: CareerInterviewProgress[];
  dreams: CareerDreamProgress[];
  offers: CareerJobOfferProgress[];
  events: CareerEventRecord[];
  isLoading: boolean;
};

export const useCareerStore = create<CareerState>()(() => ({
  progress: null,
  journey: null,
  interviews: [],
  dreams: [],
  offers: [],
  events: [],
  isLoading: true,
}));
