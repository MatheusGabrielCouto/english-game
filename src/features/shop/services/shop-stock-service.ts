import { STUDY_POINTS_SHOP } from '@/features/game-design/catalogs/loot-economy';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { ShopStockRepository } from '@/storage/repositories/shop-stock-repository';
import { getOrCreateStudyPointsBalance } from '@/storage/repositories/study-points-repository';
import { ShopPurchaseFailureReason } from '@/types/shop';
import { ShopOfferKind, type ShopOfferKindValue } from '@/types/shop-offer';
import {
    ShopStockFailureReason,
    ShopStockPeriod,
    type ShopStockCatalogEntry,
    type ShopStockItem,
    type ShopStockPeriodValue,
    type ShopStockPurchaseResult,
    type ShopStockSnapshot,
} from '@/types/shop-stock';

import {
    SHOP_STOCK_CATALOG,
    SHOP_STOCK_CATALOG_BY_ID,
} from '../catalogs/shop-stock-catalog';
import { SHOP_PRODUCTS_BY_KEY } from '../constants/shop-products';
import { SP_SHOP_PRODUCTS_BY_KEY } from '../constants/sp-shop-products';
import {
    buildStockStorageKey,
    DAILY_STOCK_SLOTS_PER_SHOP,
    getStockPeriodKey,
    WEEKLY_STOCK_SLOTS_PER_SHOP,
} from '../utils/shop-stock-keys';
import { ShopService } from './shop-service';

const RESET_LABELS: Record<ShopStockPeriodValue, string> = {
  [ShopStockPeriod.DAILY]: 'Renova à meia-noite',
  [ShopStockPeriod.WEEKLY]: 'Renova na segunda-feira',
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const pickWeightedEntry = (
  seed: string,
  eligible: ShopStockCatalogEntry[],
): ShopStockCatalogEntry | null => {
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = hashString(seed) % totalWeight;

  for (const entry of eligible) {
    if (roll < entry.weight) return entry;
    roll -= entry.weight;
  }

  return eligible[eligible.length - 1] ?? null;
};

const isProductAvailable = (shopKind: ShopOfferKindValue, productKey: string): boolean => {
  if (shopKind === ShopOfferKind.COINS) {
    return SHOP_PRODUCTS_BY_KEY[productKey]?.available === true;
  }
  return SP_SHOP_PRODUCTS_BY_KEY[productKey] != null;
};

const getPrice = (shopKind: ShopOfferKindValue, productKey: string): number | null => {
  if (shopKind === ShopOfferKind.COINS) {
    return SHOP_PRODUCTS_BY_KEY[productKey]?.price ?? null;
  }

  const spProduct = SP_SHOP_PRODUCTS_BY_KEY[productKey];
  if (spProduct) return spProduct.cost;

  const catalogEntry = STUDY_POINTS_SHOP.find((entry) => entry.key === productKey);
  return catalogEntry?.cost ?? null;
};

const buildProductView = (shopKind: ShopOfferKindValue, productKey: string) => {
  if (shopKind === ShopOfferKind.COINS) {
    const product = SHOP_PRODUCTS_BY_KEY[productKey];
    if (!product) return null;
    return {
      key: product.key,
      name: product.name,
      description: product.description,
      icon: product.icon,
    };
  }

  const product = SP_SHOP_PRODUCTS_BY_KEY[productKey];
  if (!product) return null;
  return {
    key: product.key,
    name: product.name,
    description: product.description,
    icon: product.icon,
    detail: product.detail,
  };
};

const enrichStockItem = (record: NonNullable<Awaited<ReturnType<typeof ShopStockRepository.findByStorageKey>>>): ShopStockItem | null => {
  const catalogEntry = SHOP_STOCK_CATALOG_BY_ID[record.catalogStockId];
  const product = buildProductView(record.shopKind, record.productKey);
  const price = getPrice(record.shopKind, record.productKey);
  if (!catalogEntry || !product || price == null) return null;

  return {
    storageKey: record.storageKey,
    periodType: record.periodType,
    periodKey: record.periodKey,
    shopKind: record.shopKind,
    catalogStockId: record.catalogStockId,
    title: catalogEntry.title,
    story: catalogEntry.story,
    merchantName: catalogEntry.merchantName,
    merchantEmoji: catalogEntry.merchantEmoji,
    productKey: record.productKey,
    product,
    price,
    maxStock: record.maxStock,
    stockRemaining: record.stockRemaining,
    resetLabel: RESET_LABELS[record.periodType],
  };
};

const rollSlotsForPeriod = (
  periodKey: string,
  periodType: ShopStockPeriodValue,
  shopKind: ShopOfferKindValue,
  slotCount: number,
): ShopStockCatalogEntry[] => {
  const eligible = SHOP_STOCK_CATALOG.filter(
    (entry) =>
      entry.period === periodType &&
      entry.shopKind === shopKind &&
      isProductAvailable(shopKind, entry.productKey),
  );

  const usedProductKeys = new Set<string>();
  const rolled: ShopStockCatalogEntry[] = [];

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
    const pool = eligible.filter((entry) => !usedProductKeys.has(entry.productKey));
    const entry = pickWeightedEntry(`${periodKey}:${periodType}:${shopKind}:${slotIndex}`, pool);
    if (!entry) break;
    usedProductKeys.add(entry.productKey);
    rolled.push(entry);
  }

  return rolled;
};

const ensurePeriodStock = async (
  periodType: ShopStockPeriodValue,
  shopKind: ShopOfferKindValue,
): Promise<ShopStockItem[]> => {
  const periodKey = getStockPeriodKey(periodType);
  const existing = await ShopStockRepository.findByPeriod(periodKey, periodType, shopKind);

  if (existing.length > 0) {
    return existing
      .map((record) => enrichStockItem(record))
      .filter((item): item is ShopStockItem => item != null);
  }

  const slotCount =
    periodType === ShopStockPeriod.DAILY
      ? DAILY_STOCK_SLOTS_PER_SHOP
      : WEEKLY_STOCK_SLOTS_PER_SHOP;

  const rolled = rollSlotsForPeriod(periodKey, periodType, shopKind, slotCount);
  const slots = rolled.map((entry, slotIndex) => ({
    storageKey: buildStockStorageKey(periodKey, periodType, shopKind, slotIndex),
    periodType,
    periodKey,
    shopKind,
    catalogStockId: entry.id,
    productKey: entry.productKey,
    maxStock: entry.maxStock,
    stockRemaining: entry.maxStock,
  }));

  const saved = await ShopStockRepository.saveSlots(slots);
  return saved
    .map((record) => enrichStockItem(record))
    .filter((item): item is ShopStockItem => item != null);
};

let cachedSnapshot: ShopStockSnapshot | undefined;

const buildSnapshot = async (): Promise<ShopStockSnapshot> => {
  const [dailyCoins, dailySp, weeklyCoins, weeklySp] = await Promise.all([
    ensurePeriodStock(ShopStockPeriod.DAILY, ShopOfferKind.COINS),
    ensurePeriodStock(ShopStockPeriod.DAILY, ShopOfferKind.STUDY_POINTS),
    ensurePeriodStock(ShopStockPeriod.WEEKLY, ShopOfferKind.COINS),
    ensurePeriodStock(ShopStockPeriod.WEEKLY, ShopOfferKind.STUDY_POINTS),
  ]);

  return {
    daily: { coins: dailyCoins, studyPoints: dailySp },
    weekly: { coins: weeklyCoins, studyPoints: weeklySp },
  };
};

const isStockPeriodValid = (item: ShopStockItem): boolean => {
  const currentKey = getStockPeriodKey(item.periodType);
  return item.periodKey === currentKey;
};

export const ShopStockService = {
  getCachedSnapshot(): ShopStockSnapshot | undefined {
    return cachedSnapshot;
  },

  async ensureStock(): Promise<ShopStockSnapshot> {
    cachedSnapshot = await buildSnapshot();
    return cachedSnapshot;
  },

  async refresh(): Promise<ShopStockSnapshot> {
    cachedSnapshot = undefined;
    return ShopStockService.ensureStock();
  },

  canAffordItem(item: ShopStockItem, balance: number): boolean {
    return balance >= item.price;
  },

  async purchaseStockItem(storageKey: string): Promise<ShopStockPurchaseResult> {
    const record = await ShopStockRepository.findByStorageKey(storageKey);
    if (!record) {
      return { success: false, reason: ShopStockFailureReason.UNAVAILABLE };
    }

    const item = enrichStockItem(record);
    if (!item || !isStockPeriodValid(item)) {
      return { success: false, reason: ShopStockFailureReason.EXPIRED };
    }

    if (item.stockRemaining <= 0) {
      return { success: false, reason: ShopStockFailureReason.OUT_OF_STOCK };
    }

    if (item.shopKind === ShopOfferKind.COINS) {
      const result = await ShopService.purchase(item.productKey, { stockStorageKey: storageKey });
      if (!result.success) return result;

      const updated = await ShopStockRepository.decrementStock(storageKey);
      const refreshed = updated ? enrichStockItem(updated) : null;
      if (refreshed && cachedSnapshot) {
        cachedSnapshot = await ShopStockService.refresh();
      }

      return {
        success: true,
        item: refreshed ?? { ...item, stockRemaining: item.stockRemaining - 1 },
        amountSpent: result.coinsSpent,
        quantity: result.quantity,
        currency: ShopOfferKind.COINS,
      };
    }

    const spBalance = await getOrCreateStudyPointsBalance();
    if (spBalance.balance < item.price) {
      return { success: false, reason: ShopPurchaseFailureReason.INSUFFICIENT_COINS };
    }

    const success = await StudyPointsService.purchaseShopItem(item.productKey, {
      stockStorageKey: storageKey,
    });

    if (!success) {
      return { success: false, reason: ShopStockFailureReason.UNAVAILABLE };
    }

    const updated = await ShopStockRepository.decrementStock(storageKey);
    const refreshed = updated ? enrichStockItem(updated) : null;
    if (refreshed && cachedSnapshot) {
      cachedSnapshot = await ShopStockService.refresh();
    }

    return {
      success: true,
      item: refreshed ?? { ...item, stockRemaining: item.stockRemaining - 1 },
      amountSpent: item.price,
      quantity: 1,
      currency: ShopOfferKind.STUDY_POINTS,
    };
  },
};
