import { create } from 'zustand';

import { LearningDifficulty, type LearningDifficultyValue } from '@/features/game-design/constants/difficulty';
import {
    getAppSettings,
    saveAppSettings,
} from '@/storage/repositories/app-settings-repository';
import { debounce } from '@/utils/debounce';

type AppState = {
  hasOnboarded: boolean;
  difficulty: LearningDifficultyValue;
  avatarFrame: string;
  avatarBadge: string | null;
  _hasHydrated: boolean;
  setHasOnboarded: (value: boolean) => void;
  setDifficulty: (value: LearningDifficultyValue) => void;
  setAvatarFrame: (value: string) => void;
  setAvatarBadge: (value: string | null) => void;
  setHasHydrated: (value: boolean) => void;
};

const persistSettings = debounce(() => {
  void (async () => {
    const state = useAppStore.getState();
    const current = await getAppSettings();
    await saveAppSettings({
      ...current,
      hasOnboarded: state.hasOnboarded,
      difficulty: state.difficulty,
      avatarFrame: state.avatarFrame,
      avatarBadge: state.avatarBadge,
    });
  })();
}, 400);

export const useAppStore = create<AppState>()((set) => ({
  hasOnboarded: false,
  difficulty: LearningDifficulty.BALANCED,
  avatarFrame: 'default',
  avatarBadge: null,
  _hasHydrated: false,

  setHasOnboarded: (value) => {
    set({ hasOnboarded: value });
    persistSettings();
  },

  setDifficulty: (value) => {
    set({ difficulty: value });
    persistSettings();
  },

  setAvatarFrame: (value) => {
    set({ avatarFrame: value });
    persistSettings();
  },

  setAvatarBadge: (value) => {
    set({ avatarBadge: value });
    persistSettings();
  },

  setHasHydrated: (value) => set({ _hasHydrated: value }),
}));
