import { useCallback, useEffect, useState } from 'react';

import { isApplicationStoresHydrated } from '@/storage/application-hydration';
import type { AcquisitionHistoryRecord, InventorySnapshot } from '@/types/inventory';

import { InventoryService } from '../services/inventory-service';
import { useInventoryScreenStore } from '../store/inventory-screen-store';

export const useInventory = () => {
  const [snapshot, setSnapshot] = useState<InventorySnapshot | null>(
    InventoryService.getCachedSnapshot(),
  );
  const [history, setHistory] = useState<AcquisitionHistoryRecord[]>([]);
  const isLoading = useInventoryScreenStore((s) => s.isLoading);
  const isRefreshing = useInventoryScreenStore((s) => s.isRefreshing);
  const setLoading = useInventoryScreenStore((s) => s.setLoading);
  const setRefreshing = useInventoryScreenStore((s) => s.setRefreshing);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const nextSnapshot = await InventoryService.refresh();
    const nextHistory = await InventoryService.getHistory();
    setSnapshot(nextSnapshot);
    setHistory(nextHistory);
    setRefreshing(false);
    setLoading(false);
  }, [setLoading, setRefreshing]);

  useEffect(() => {
    const unsubscribe = InventoryService.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
      setLoading(false);
    });

    void InventoryService.getHistory().then(setHistory);

    const cached = InventoryService.getCachedSnapshot();
    if (cached) {
      setSnapshot(cached);
      setLoading(false);
      return unsubscribe;
    }

    if (isApplicationStoresHydrated()) {
      setLoading(false);
      return unsubscribe;
    }

    void refresh();

    return unsubscribe;
  }, [refresh, setLoading]);

  return {
    snapshot,
    history,
    isLoading,
    isRefreshing,
    refresh,
  };
};
