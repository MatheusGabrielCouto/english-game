import { create } from 'zustand';

type PetScreenState = {
  isLoading: boolean;
  isRefreshing: boolean;
  evolutionMessage: string | null;
  dialogueMessage: string | null;
  setLoading: (value: boolean) => void;
  setRefreshing: (value: boolean) => void;
  setEvolutionMessage: (message: string | null) => void;
  setDialogueMessage: (message: string | null) => void;
  clearEvolutionMessage: () => void;
};

export const usePetScreenStore = create<PetScreenState>((set) => ({
  isLoading: true,
  isRefreshing: false,
  evolutionMessage: null,
  dialogueMessage: null,

  setLoading: (value) => set({ isLoading: value }),
  setRefreshing: (value) => set({ isRefreshing: value }),
  setEvolutionMessage: (message) => set({ evolutionMessage: message }),
  setDialogueMessage: (message) => set({ dialogueMessage: message }),
  clearEvolutionMessage: () => set({ evolutionMessage: null }),
}));
