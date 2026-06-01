import { create } from 'zustand';

export type LevelUpCelebration = {
  level: number;
  previousLevel: number;
  levelsGained: number;
};

export type MissionRewardBurst = {
  id: string;
  title: string;
  xp: number;
  coins: number;
};

export type PetEvolutionCelebration = {
  stage: string;
  emoji: string;
  label: string;
};

export type PrestigeCelebration = {
  tierLevel: number;
  tierName: string;
  tierRoman: string;
  sacrifice: string;
  permanentBonuses: string[];
};

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export type ToastMessage = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

type FeedbackState = {
  levelUpQueue: LevelUpCelebration[];
  activeLevelUp: LevelUpCelebration | null;
  rewardBursts: MissionRewardBurst[];
  petEvolution: PetEvolutionCelebration | null;
  prestigeCelebration: PrestigeCelebration | null;
  showConfetti: boolean;
  toastQueue: ToastMessage[];
  activeToast: ToastMessage | null;
  enqueueLevelUp: (celebration: LevelUpCelebration) => void;
  dequeueLevelUp: () => void;
  addRewardBurst: (burst: Omit<MissionRewardBurst, 'id'>) => void;
  removeRewardBurst: (id: string) => void;
  setPetEvolution: (celebration: PetEvolutionCelebration | null) => void;
  setPrestigeCelebration: (celebration: PrestigeCelebration | null) => void;
  triggerConfetti: () => void;
  clearConfetti: () => void;
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  dismissToast: () => void;
};

export const useFeedbackStore = create<FeedbackState>()((set, get) => ({
  levelUpQueue: [],
  activeLevelUp: null,
  rewardBursts: [],
  petEvolution: null,
  prestigeCelebration: null,
  showConfetti: false,
  toastQueue: [],
  activeToast: null,

  enqueueLevelUp: (celebration) => {
    const { activeLevelUp, levelUpQueue } = get();
    if (!activeLevelUp) {
      set({ activeLevelUp: celebration, showConfetti: true });
      return;
    }
    set({ levelUpQueue: [...levelUpQueue, celebration] });
  },

  dequeueLevelUp: () => {
    const [next, ...rest] = get().levelUpQueue;
    set({
      activeLevelUp: next ?? null,
      levelUpQueue: rest,
      showConfetti: next ? true : get().showConfetti,
    });
  },

  addRewardBurst: (burst) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      rewardBursts: [...state.rewardBursts, { ...burst, id }],
    }));
  },

  removeRewardBurst: (id) => {
    set((state) => ({
      rewardBursts: state.rewardBursts.filter((burst) => burst.id !== id),
    }));
  },

  setPetEvolution: (celebration) => {
    set({ petEvolution: celebration, showConfetti: celebration !== null });
  },

  setPrestigeCelebration: (celebration) => {
    set({ prestigeCelebration: celebration, showConfetti: celebration !== null });
  },

  triggerConfetti: () => set({ showConfetti: true }),

  clearConfetti: () => set({ showConfetti: false }),

  showToast: (message, variant = 'success', durationMs = 2800) => {
    const toast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      variant,
      durationMs,
    };

    const { activeToast, toastQueue } = get();
    if (!activeToast) {
      set({ activeToast: toast });
      return;
    }

    set({ toastQueue: [...toastQueue, toast] });
  },

  dismissToast: () => {
    const [next, ...rest] = get().toastQueue;
    set({
      activeToast: next ?? null,
      toastQueue: rest,
    });
  },
}));
