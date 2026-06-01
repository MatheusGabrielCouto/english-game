import { create } from 'zustand';

import type { LootBoxRecord } from '@/types/inventory';
import type { LootBoxOpenResult } from '@/types/loot-box';

type LootBoxScreenState = {
  isLoading: boolean;
  isOpening: boolean;
  selectedBoxId: number | null;
  openingBox: LootBoxRecord | null;
  lastResult: LootBoxOpenResult | null;
  setLoading: (value: boolean) => void;
  setOpening: (value: boolean) => void;
  setSelectedBoxId: (id: number | null) => void;
  setOpeningBox: (box: LootBoxRecord | null) => void;
  setLastResult: (result: LootBoxOpenResult | null) => void;
  clearLastResult: () => void;
};

export const useLootBoxScreenStore = create<LootBoxScreenState>((set) => ({
  isLoading: true,
  isOpening: false,
  selectedBoxId: null,
  openingBox: null,
  lastResult: null,

  setLoading: (value) => set({ isLoading: value }),
  setOpening: (value) => set({ isOpening: value }),
  setSelectedBoxId: (id) => set({ selectedBoxId: id }),
  setOpeningBox: (box) => set({ openingBox: box }),
  setLastResult: (result) => set({ lastResult: result }),
  clearLastResult: () => set({ lastResult: null }),
}));
