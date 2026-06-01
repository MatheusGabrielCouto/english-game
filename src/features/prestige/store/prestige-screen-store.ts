import { create } from 'zustand';

import { PrestigeSacrificeType, type PrestigeSacrificeValue } from '@/types/prestige';

type AscensionStep = 'choose' | 'review';

type PrestigeScreenState = {
  ascensionModalOpen: boolean;
  ascensionStep: AscensionStep;
  selectedSacrifice: PrestigeSacrificeValue | null;
  isAscending: boolean;
  openAscension: () => void;
  closeAscension: () => void;
  setSacrifice: (sacrifice: PrestigeSacrificeValue) => void;
  goToReview: () => void;
  backToChoose: () => void;
  setIsAscending: (value: boolean) => void;
};

export const usePrestigeScreenStore = create<PrestigeScreenState>()((set) => ({
  ascensionModalOpen: false,
  ascensionStep: 'choose',
  selectedSacrifice: null,
  isAscending: false,
  openAscension: () =>
    set({
      ascensionModalOpen: true,
      ascensionStep: 'choose',
      selectedSacrifice: null,
      isAscending: false,
    }),
  closeAscension: () =>
    set({
      ascensionModalOpen: false,
      ascensionStep: 'choose',
      selectedSacrifice: null,
      isAscending: false,
    }),
  setSacrifice: (sacrifice) => set({ selectedSacrifice: sacrifice }),
  goToReview: () => set({ ascensionStep: 'review' }),
  backToChoose: () => set({ ascensionStep: 'choose' }),
  setIsAscending: (value) => set({ isAscending: value }),
}));

export const DEFAULT_SACRIFICE = PrestigeSacrificeType.COINS;
