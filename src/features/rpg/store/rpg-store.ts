import { create } from 'zustand';

import type { PlayerRpgRecord } from '@/features/game-design/constants/rpg';

type RpgStoreState = {
  record: PlayerRpgRecord | null;
  isLoading: boolean;
};

export const useRpgStore = create<RpgStoreState>(() => ({
  record: null,
  isLoading: true,
}));
