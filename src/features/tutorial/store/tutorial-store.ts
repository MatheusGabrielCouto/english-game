import { create } from 'zustand';

type TutorialStore = {
  isVisible: boolean;
  currentStep: number;
  wizardCompleted: boolean;
  open: (step?: number) => void;
  close: () => void;
  next: (totalSteps: number) => void;
  previous: () => void;
  setStep: (step: number) => void;
  completeWizard: () => void;
};

export const useTutorialStore = create<TutorialStore>()((set) => ({
  isVisible: false,
  currentStep: 0,
  wizardCompleted: false,

  open: (step = 0) => set({ isVisible: true, currentStep: step }),

  close: () => set({ isVisible: false }),

  next: (totalSteps) =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, totalSteps - 1),
    })),

  previous: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  setStep: (step) => set({ currentStep: step }),

  completeWizard: () => set({ wizardCompleted: true }),
}));
