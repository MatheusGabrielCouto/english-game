import { useCallback, useEffect, useState } from 'react';

import type { LootBoxRecord } from '@/types/inventory';
import type { LootBoxAnalyticsRecord, LootBoxOpenHistoryRecord } from '@/types/loot-box';

import { LootBoxService } from '../services/loot-box-service';
import { useLootBoxScreenStore } from '../store/loot-box-screen-store';

export const useLootBoxes = () => {
  const [boxes, setBoxes] = useState<LootBoxRecord[]>([]);
  const [history, setHistory] = useState<LootBoxOpenHistoryRecord[]>([]);
  const [analytics, setAnalytics] = useState<LootBoxAnalyticsRecord | null>(null);
  const isLoading = useLootBoxScreenStore((s) => s.isLoading);
  const isOpening = useLootBoxScreenStore((s) => s.isOpening);
  const lastResult = useLootBoxScreenStore((s) => s.lastResult);
  const selectedBoxId = useLootBoxScreenStore((s) => s.selectedBoxId);
  const openingBox = useLootBoxScreenStore((s) => s.openingBox);
  const setLoading = useLootBoxScreenStore((s) => s.setLoading);
  const setOpening = useLootBoxScreenStore((s) => s.setOpening);
  const setSelectedBoxId = useLootBoxScreenStore((s) => s.setSelectedBoxId);
  const setOpeningBox = useLootBoxScreenStore((s) => s.setOpeningBox);
  const setLastResult = useLootBoxScreenStore((s) => s.setLastResult);
  const clearLastResult = useLootBoxScreenStore((s) => s.clearLastResult);

  const refresh = useCallback(async () => {
    const [nextBoxes, nextHistory, nextAnalytics] = await Promise.all([
      LootBoxService.getUnopenedBoxes(),
      LootBoxService.getOpenHistory(),
      LootBoxService.getAnalytics(),
    ]);

    setBoxes(nextBoxes);
    setHistory(nextHistory);
    setAnalytics(nextAnalytics);
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openBox = useCallback(
    (id: number) => {
      if (useLootBoxScreenStore.getState().isOpening) return;

      const box = boxes.find((entry) => entry.id === id);
      if (!box) return;

      setOpening(true);
      setSelectedBoxId(id);
      setOpeningBox(box);
    },
    [boxes, setOpening, setOpeningBox, setSelectedBoxId],
  );

  const finalizeBoxOpen = useCallback(async () => {
    const { selectedBoxId: boxId, isOpening: opening } = useLootBoxScreenStore.getState();
    if (!opening || boxId == null) return null;

    setOpeningBox(null);

    const result = await LootBoxService.openLootBox(boxId);
    if (result) {
      setLastResult(result);
    }

    await refresh();
    setOpening(false);
    setSelectedBoxId(null);
    return result;
  }, [refresh, setLastResult, setOpening, setOpeningBox, setSelectedBoxId]);

  return {
    boxes,
    history,
    analytics,
    isLoading,
    isOpening,
    lastResult,
    selectedBoxId,
    openingBox,
    refresh,
    openBox,
    finalizeBoxOpen,
    clearLastResult,
  };
};
