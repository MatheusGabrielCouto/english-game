import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { showGameToast } from '@/features/feedback/services/feedback-service';
import { useInventory } from '@/features/inventory/hooks/use-inventory';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { usePlayerStore } from '@/features/player';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { useStudyPointsStore } from '@/features/study-points/store/study-points-store';
import type { LootBoxRarityValue } from '@/types/inventory';
import type { ShopAnalyticsSummary, ShopProduct, ShopPurchaseHistoryRecord } from '@/types/shop';

import { SHOP_MESSAGES } from '../constants/shop-products';
import { SP_SHOP_MESSAGES, SP_SHOP_PRODUCTS, SP_UPGRADE_MESSAGES, type SpShopProductDisplay } from '../constants/sp-shop-products';
import { ShopService } from '../services/shop-service';
import { useShopScreenStore } from '../store/shop-screen-store';

export const useShop = () => {
  const coins = usePlayerStore((state) => state.coins);
  const studyPointsBalance = useStudyPointsStore((state) => state.balance?.balance ?? 0);
  const { snapshot } = useInventory();
  const lootBoxCounts = snapshot?.lootBoxes.byRarity ?? null;
  const [products] = useState<ShopProduct[]>(() => ShopService.getProducts());
  const [spProducts] = useState<SpShopProductDisplay[]>(() => SP_SHOP_PRODUCTS);
  const [analytics, setAnalytics] = useState<ShopAnalyticsSummary | null>(
    ShopService.getCachedAnalytics(),
  );
  const [history, setHistory] = useState<ShopPurchaseHistoryRecord[]>(
    ShopService.getCachedHistory(),
  );
  const [isLoading, setIsLoading] = useState(!ShopService.getCachedAnalytics());

  const selectedProduct = useShopScreenStore((state) => state.selectedProduct);
  const selectedSpProduct = useShopScreenStore((state) => state.selectedSpProduct);
  const isPurchasing = useShopScreenStore((state) => state.isPurchasing);
  const toastMessage = useShopScreenStore((state) => state.toastMessage);
  const toastKey = useShopScreenStore((state) => state.toastKey);
  const toastVariant = useShopScreenStore((state) => state.toastVariant);
  const setSelectedProduct = useShopScreenStore((state) => state.setSelectedProduct);
  const setSelectedSpProduct = useShopScreenStore((state) => state.setSelectedSpProduct);
  const setIsPurchasing = useShopScreenStore((state) => state.setIsPurchasing);
  const showToast = useShopScreenStore((state) => state.showToast);
  const clearToast = useShopScreenStore((state) => state.clearToast);

  const refresh = useCallback(async () => {
    await Promise.all([ShopService.refresh(), StudyPointsService.refresh()]);
    setAnalytics(ShopService.getCachedAnalytics());
    setHistory(ShopService.getCachedHistory());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (ShopService.getCachedAnalytics()) {
      setIsLoading(false);
      return;
    }

    void refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      void InventoryService.refresh();
      void StudyPointsService.refresh();
    }, []),
  );

  const handleSelectProduct = useCallback(
    (product: ShopProduct) => {
      if (!product.available) {
        showToast(SHOP_MESSAGES.unavailable, 'info');
        return;
      }
      setSelectedProduct(product);
    },
    [setSelectedProduct, showToast],
  );

  const handleSelectSpProduct = useCallback(
    (product: SpShopProductDisplay) => {
      setSelectedSpProduct(product);
    },
    [setSelectedSpProduct],
  );

  const handleCancelPurchase = useCallback(() => {
    setSelectedProduct(null);
    showToast(SHOP_MESSAGES.purchaseCanceled, 'info');
  }, [setSelectedProduct, showToast]);

  const handleCancelSpPurchase = useCallback(() => {
    setSelectedSpProduct(null);
    showToast(SP_SHOP_MESSAGES.purchaseCanceled, 'info');
  }, [setSelectedSpProduct, showToast]);

  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedProduct || isPurchasing) return;

    setIsPurchasing(true);

    const result = await ShopService.purchase(selectedProduct.key);

    setIsPurchasing(false);
    setSelectedProduct(null);

    if (!result.success) {
      if (result.reason === 'insufficient_coins') {
        showToast(SHOP_MESSAGES.insufficientCoins, 'info');
        return;
      }

      showToast(SHOP_MESSAGES.unavailable, 'info');
      return;
    }

    await refresh();
  }, [isPurchasing, refresh, selectedProduct, setIsPurchasing, setSelectedProduct]);

  const handleConfirmSpPurchase = useCallback(async () => {
    if (!selectedSpProduct || isPurchasing) return;

    setIsPurchasing(true);
    const success = await StudyPointsService.purchaseShopItem(selectedSpProduct.key);
    setIsPurchasing(false);
    setSelectedSpProduct(null);

    if (!success) {
      showToast(SP_SHOP_MESSAGES.insufficientSp, 'info');
      return;
    }

    await InventoryService.refresh();
    showGameToast(`${SP_SHOP_MESSAGES.purchaseCompleted} ${SP_SHOP_MESSAGES.itemReceived}`, 'success');
    await refresh();
  }, [isPurchasing, refresh, selectedSpProduct, setIsPurchasing, setSelectedSpProduct, showToast]);

  const handleUpgradeLootBox = useCallback(
    async (fromRarity: LootBoxRarityValue) => {
      if (isPurchasing) return;

      setIsPurchasing(true);
      const result = await StudyPointsService.upgradeLootBox(fromRarity);
      setIsPurchasing(false);

      showToast(SP_UPGRADE_MESSAGES[result], result === 'success' ? 'success' : 'info');

      if (result === 'success') {
        await InventoryService.refresh();
        await refresh();
      }
    },
    [isPurchasing, refresh, setIsPurchasing, showToast],
  );

  const canAfford = useCallback(
    (product: ShopProduct) => ShopService.canAfford(product, coins),
    [coins],
  );

  const canAffordSp = useCallback(
    (product: SpShopProductDisplay) => studyPointsBalance >= product.cost,
    [studyPointsBalance],
  );

  return {
    coins,
    studyPointsBalance,
    lootBoxCounts,
    products,
    spProducts,
    analytics,
    history,
    isLoading,
    selectedProduct,
    selectedSpProduct,
    isPurchasing,
    toastMessage,
    toastKey,
    toastVariant,
    canAfford,
    canAffordSp,
    handleSelectProduct,
    handleSelectSpProduct,
    handleCancelPurchase,
    handleCancelSpPurchase,
    handleConfirmPurchase,
    handleConfirmSpPurchase,
    handleUpgradeLootBox,
    clearToast,
  };
};

export type UseShopReturn = ReturnType<typeof useShop>;
