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
import type { ShopDailyOffer } from '@/types/shop-offer';
import { ShopOfferFailureReason, ShopOfferKind } from '@/types/shop-offer';
import type { ShopStockItem, ShopStockSnapshot } from '@/types/shop-stock';
import { ShopStockFailureReason } from '@/types/shop-stock';

import { SHOP_OFFER_MESSAGES } from '../catalogs/shop-offer-catalog';
import { SHOP_STOCK_MESSAGES } from '../catalogs/shop-stock-catalog';
import { SHOP_MESSAGES } from '../constants/shop-products';
import {
    SP_SHOP_MESSAGES,
    SP_SHOP_OFFER_MESSAGES,
    SP_SHOP_PRODUCTS,
    SP_UPGRADE_MESSAGES,
    type SpShopProductDisplay,
} from '../constants/sp-shop-products';
import { ShopOfferService } from '../services/shop-offer-service';
import { ShopService } from '../services/shop-service';
import { ShopStockService } from '../services/shop-stock-service';
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
  const [dailyOfferCoins, setDailyOfferCoins] = useState<ShopDailyOffer | null>(
    ShopOfferService.getCachedTodayOffer(ShopOfferKind.COINS) ?? null,
  );
  const [dailyOfferSp, setDailyOfferSp] = useState<ShopDailyOffer | null>(
    ShopOfferService.getCachedTodayOffer(ShopOfferKind.STUDY_POINTS) ?? null,
  );
  const [stock, setStock] = useState<ShopStockSnapshot>(
    () =>
      ShopStockService.getCachedSnapshot() ?? {
        daily: { coins: [], studyPoints: [] },
        weekly: { coins: [], studyPoints: [] },
      },
  );

  const selectedProduct = useShopScreenStore((state) => state.selectedProduct);
  const selectedDailyOffer = useShopScreenStore((state) => state.selectedDailyOffer);
  const selectedStockItem = useShopScreenStore((state) => state.selectedStockItem);
  const selectedSpProduct = useShopScreenStore((state) => state.selectedSpProduct);
  const isPurchasing = useShopScreenStore((state) => state.isPurchasing);
  const toastMessage = useShopScreenStore((state) => state.toastMessage);
  const toastKey = useShopScreenStore((state) => state.toastKey);
  const toastVariant = useShopScreenStore((state) => state.toastVariant);
  const setSelectedProduct = useShopScreenStore((state) => state.setSelectedProduct);
  const setSelectedDailyOffer = useShopScreenStore((state) => state.setSelectedDailyOffer);
  const setSelectedStockItem = useShopScreenStore((state) => state.setSelectedStockItem);
  const setSelectedSpProduct = useShopScreenStore((state) => state.setSelectedSpProduct);
  const setIsPurchasing = useShopScreenStore((state) => state.setIsPurchasing);
  const showToast = useShopScreenStore((state) => state.showToast);
  const clearToast = useShopScreenStore((state) => state.clearToast);

  const refresh = useCallback(async () => {
    const [, , offers, stockSnapshot] = await Promise.all([
      ShopService.refresh(),
      StudyPointsService.refresh(),
      ShopOfferService.refresh(),
      ShopStockService.refresh(),
    ]);
    setAnalytics(ShopService.getCachedAnalytics());
    setHistory(ShopService.getCachedHistory());
    setDailyOfferCoins(offers.coins);
    setDailyOfferSp(offers.studyPoints);
    setStock(stockSnapshot);
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
      void Promise.all([
        ShopOfferService.ensureTodayOffers(),
        ShopStockService.ensureStock(),
      ]).then(([offers, stockSnapshot]) => {
        setDailyOfferCoins(offers.coins);
        setDailyOfferSp(offers.studyPoints);
        setStock(stockSnapshot);
      });
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

  const handleSelectDailyOffer = useCallback(
    (offer: ShopDailyOffer) => {
      if (offer.purchased) {
        showToast(
          offer.shopKind === ShopOfferKind.COINS
            ? SHOP_OFFER_MESSAGES.alreadyPurchased
            : SP_SHOP_OFFER_MESSAGES.alreadyPurchased,
          'info',
        );
        return;
      }
      setSelectedDailyOffer(offer);
    },
    [setSelectedDailyOffer, showToast],
  );

  const handleCancelOfferPurchase = useCallback(() => {
    setSelectedDailyOffer(null);
    showToast(SHOP_MESSAGES.purchaseCanceled, 'info');
  }, [setSelectedDailyOffer, showToast]);

  const handleSelectStockItem = useCallback(
    (item: ShopStockItem) => {
      if (item.stockRemaining <= 0) {
        showToast(SHOP_STOCK_MESSAGES.outOfStock, 'info');
        return;
      }
      setSelectedStockItem(item);
    },
    [setSelectedStockItem, showToast],
  );

  const handleCancelStockPurchase = useCallback(() => {
    setSelectedStockItem(null);
    showToast(SHOP_STOCK_MESSAGES.purchaseCanceled, 'info');
  }, [setSelectedStockItem, showToast]);

  const handleConfirmStockPurchase = useCallback(async () => {
    if (!selectedStockItem || isPurchasing) return;

    setIsPurchasing(true);
    const result = await ShopStockService.purchaseStockItem(selectedStockItem.storageKey);
    setIsPurchasing(false);
    setSelectedStockItem(null);

    const isCoinsStock = selectedStockItem.shopKind === ShopOfferKind.COINS;

    if (!result.success) {
      if (result.reason === ShopStockFailureReason.OUT_OF_STOCK) {
        showToast(SHOP_STOCK_MESSAGES.outOfStock, 'info');
        await refresh();
        return;
      }
      if (result.reason === 'insufficient_coins') {
        showToast(
          isCoinsStock ? SHOP_STOCK_MESSAGES.insufficientCoins : SHOP_STOCK_MESSAGES.insufficientSp,
          'info',
        );
        return;
      }
      showToast(SHOP_STOCK_MESSAGES.unavailable, 'info');
      return;
    }

    showToast(
      `${SHOP_STOCK_MESSAGES.purchaseCompleted} ${SHOP_STOCK_MESSAGES.itemReceived}`,
      'success',
    );
    await InventoryService.refresh();
    await refresh();
  }, [isPurchasing, refresh, selectedStockItem, setIsPurchasing, setSelectedStockItem, showToast]);

  const handleConfirmOfferPurchase = useCallback(async () => {
    if (!selectedDailyOffer || isPurchasing) return;

    setIsPurchasing(true);
    const result = await ShopOfferService.purchaseTodayOffer(selectedDailyOffer.shopKind);
    setIsPurchasing(false);
    setSelectedDailyOffer(null);

    const isCoinsOffer = selectedDailyOffer.shopKind === ShopOfferKind.COINS;

    if (!result.success) {
      if (result.reason === ShopOfferFailureReason.ALREADY_PURCHASED) {
        showToast(
          isCoinsOffer
            ? SHOP_OFFER_MESSAGES.alreadyPurchased
            : SP_SHOP_OFFER_MESSAGES.alreadyPurchased,
          'info',
        );
        await refresh();
        return;
      }
      if (result.reason === 'insufficient_coins') {
        showToast(
          isCoinsOffer
            ? SHOP_OFFER_MESSAGES.insufficientCoins
            : SP_SHOP_OFFER_MESSAGES.insufficientSp,
          'info',
        );
        return;
      }
      showToast(
        isCoinsOffer ? SHOP_OFFER_MESSAGES.unavailable : SP_SHOP_OFFER_MESSAGES.unavailable,
        'info',
      );
      return;
    }

    const messages = isCoinsOffer ? SHOP_OFFER_MESSAGES : SP_SHOP_OFFER_MESSAGES;
    showToast(`${messages.purchaseCompleted} ${messages.itemReceived}`, 'success');
    if (!isCoinsOffer) {
      await InventoryService.refresh();
    }
    await refresh();
  }, [isPurchasing, refresh, selectedDailyOffer, setIsPurchasing, setSelectedDailyOffer, showToast]);

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

  const canAffordOffer = useCallback(
    (offer: ShopDailyOffer) => {
      const balance =
        offer.shopKind === ShopOfferKind.COINS ? coins : studyPointsBalance;
      return ShopOfferService.canAffordOffer(offer, balance);
    },
    [coins, studyPointsBalance],
  );

  const canAffordSp = useCallback(
    (product: SpShopProductDisplay) => studyPointsBalance >= product.cost,
    [studyPointsBalance],
  );

  const canAffordStock = useCallback(
    (item: ShopStockItem) => {
      const balance = item.shopKind === ShopOfferKind.COINS ? coins : studyPointsBalance;
      return ShopStockService.canAffordItem(item, balance);
    },
    [coins, studyPointsBalance],
  );

  return {
    coins,
    studyPointsBalance,
    lootBoxCounts,
    products,
    spProducts,
    dailyOfferCoins,
    dailyOfferSp,
    stock,
    analytics,
    history,
    isLoading,
    selectedProduct,
    selectedDailyOffer,
    selectedStockItem,
    selectedSpProduct,
    isPurchasing,
    toastMessage,
    toastKey,
    toastVariant,
    canAfford,
    canAffordOffer,
    canAffordStock,
    canAffordSp,
    handleSelectProduct,
    handleSelectDailyOffer,
    handleSelectStockItem,
    handleCancelOfferPurchase,
    handleConfirmOfferPurchase,
    handleCancelStockPurchase,
    handleConfirmStockPurchase,
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
