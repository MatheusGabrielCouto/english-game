import { STUDY_POINTS_SHOP } from '@/features/game-design/catalogs/loot-economy';
import { getTodayKey } from '@/features/quests/utils/date';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { getOrCreateStudyPointsBalance } from '@/storage/repositories/study-points-repository';
import { ShopPurchaseFailureReason } from '@/types/shop';
import { ShopOfferRepository } from '@/storage/repositories/shop-offer-repository';
import {
  ShopOfferKind,
  type ShopDailyOffer,
  type ShopOfferCatalogEntry,
  type ShopOfferKindValue,
  type ShopOfferProductView,
  type ShopOfferPurchaseResult,
} from '@/types/shop-offer';
import { ShopOfferFailureReason } from '@/types/shop-offer';

import {
  SHOP_OFFER_CATALOG,
  SHOP_OFFER_CATALOG_BY_ID,
} from '../catalogs/shop-offer-catalog';
import {
  SP_SHOP_OFFER_CATALOG,
  SP_SHOP_OFFER_CATALOG_BY_ID,
} from '../catalogs/sp-shop-offer-catalog';
import { SHOP_PRODUCTS_BY_KEY } from '../constants/shop-products';
import { SP_SHOP_PRODUCTS_BY_KEY } from '../constants/sp-shop-products';
import { buildOfferStorageKey } from '../utils/shop-offer-keys';
import { ShopOfferNotificationService } from './shop-offer-notification-service';
import { ShopService } from './shop-service';

const OFFER_DAY_CHANCE_PERCENT = 50;

const ALL_OFFER_CATALOG_BY_ID = {
  ...SHOP_OFFER_CATALOG_BY_ID,
  ...SP_SHOP_OFFER_CATALOG_BY_ID,
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const shouldHaveOfferToday = (dateKey: string, shopKind: ShopOfferKindValue): boolean => {
  const hash = hashString(`shop-offer-day:${dateKey}:${shopKind}`);
  return hash % 100 < OFFER_DAY_CHANCE_PERCENT;
};

const computeOfferPrice = (originalPrice: number, discountPercent: number): number => {
  const discounted = Math.ceil((originalPrice * (100 - discountPercent)) / 100);
  const minPrice = Math.ceil(originalPrice * 0.75);
  return Math.max(discounted, minPrice);
};

const pickWeightedCatalogEntry = (
  dateKey: string,
  shopKind: ShopOfferKindValue,
  eligible: ShopOfferCatalogEntry[],
): ShopOfferCatalogEntry | null => {
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = hashString(`shop-offer-roll:${dateKey}:${shopKind}`) % totalWeight;

  for (const entry of eligible) {
    if (roll < entry.weight) return entry;
    roll -= entry.weight;
  }

  return eligible[eligible.length - 1] ?? null;
};

const getOriginalPrice = (shopKind: ShopOfferKindValue, productKey: string): number | null => {
  if (shopKind === ShopOfferKind.COINS) {
    return SHOP_PRODUCTS_BY_KEY[productKey]?.price ?? null;
  }

  const spProduct = SP_SHOP_PRODUCTS_BY_KEY[productKey];
  if (spProduct) return spProduct.cost;

  const catalogEntry = STUDY_POINTS_SHOP.find((entry) => entry.key === productKey);
  return catalogEntry?.cost ?? null;
};

const isProductAvailable = (shopKind: ShopOfferKindValue, productKey: string): boolean => {
  if (shopKind === ShopOfferKind.COINS) {
    return SHOP_PRODUCTS_BY_KEY[productKey]?.available === true;
  }
  return SP_SHOP_PRODUCTS_BY_KEY[productKey] != null;
};

const getEligibleCatalogEntries = (shopKind: ShopOfferKindValue): ShopOfferCatalogEntry[] => {
  const catalog = shopKind === ShopOfferKind.COINS ? SHOP_OFFER_CATALOG : SP_SHOP_OFFER_CATALOG;
  return catalog.filter(
    (entry) => entry.shopKind === shopKind && isProductAvailable(shopKind, entry.productKey),
  );
};

const buildProductView = (
  shopKind: ShopOfferKindValue,
  productKey: string,
): ShopOfferProductView | null => {
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

const findOfferRecord = async (dateKey: string, shopKind: ShopOfferKindValue) => {
  const storageKey = buildOfferStorageKey(dateKey, shopKind);
  const record = await ShopOfferRepository.findByDateKey(storageKey);
  if (record) return record;

  if (shopKind === ShopOfferKind.COINS) {
    return ShopOfferRepository.findByDateKey(dateKey);
  }

  return null;
};

const enrichOffer = async (
  record: NonNullable<Awaited<ReturnType<typeof ShopOfferRepository.findByDateKey>>>,
  shopKind: ShopOfferKindValue,
): Promise<ShopDailyOffer | null> => {
  if (!record.hasOffer || !record.catalogOfferId || !record.productKey) return null;
  if (record.offerPrice == null || record.originalPrice == null || record.discountPercent == null) {
    return null;
  }

  const catalogEntry = ALL_OFFER_CATALOG_BY_ID[record.catalogOfferId];
  const productView = buildProductView(shopKind, record.productKey);
  if (!catalogEntry || !productView) return null;

  const storageKey = record.dateKey;
  const dateKey = record.dateKey.includes(':') ? record.dateKey.split(':')[0] : record.dateKey;

  return {
    shopKind,
    storageKey,
    dateKey,
    catalogOfferId: record.catalogOfferId,
    title: catalogEntry.title,
    story: catalogEntry.story,
    merchantName: catalogEntry.merchantName,
    merchantEmoji: catalogEntry.merchantEmoji,
    productKey: record.productKey,
    product: productView,
    discountPercent: record.discountPercent,
    originalPrice: record.originalPrice,
    offerPrice: record.offerPrice,
    purchased: record.purchased,
    coinsProduct:
      shopKind === ShopOfferKind.COINS
        ? SHOP_PRODUCTS_BY_KEY[record.productKey]
        : undefined,
    spProduct:
      shopKind === ShopOfferKind.STUDY_POINTS
        ? SP_SHOP_PRODUCTS_BY_KEY[record.productKey]
        : undefined,
  };
};

const rollOfferForDate = (
  dateKey: string,
  shopKind: ShopOfferKindValue,
): ShopDailyOffer | null => {
  const catalogEntry = pickWeightedCatalogEntry(
    dateKey,
    shopKind,
    getEligibleCatalogEntries(shopKind),
  );
  if (!catalogEntry) return null;

  const originalPrice = getOriginalPrice(shopKind, catalogEntry.productKey);
  const productView = buildProductView(shopKind, catalogEntry.productKey);
  if (originalPrice == null || !productView) return null;

  const offerPrice = computeOfferPrice(originalPrice, catalogEntry.discountPercent);
  const storageKey = buildOfferStorageKey(dateKey, shopKind);

  return {
    shopKind,
    storageKey,
    dateKey,
    catalogOfferId: catalogEntry.id,
    title: catalogEntry.title,
    story: catalogEntry.story,
    merchantName: catalogEntry.merchantName,
    merchantEmoji: catalogEntry.merchantEmoji,
    productKey: catalogEntry.productKey,
    product: productView,
    discountPercent: catalogEntry.discountPercent,
    originalPrice,
    offerPrice,
    purchased: false,
    coinsProduct:
      shopKind === ShopOfferKind.COINS
        ? SHOP_PRODUCTS_BY_KEY[catalogEntry.productKey]
        : undefined,
    spProduct:
      shopKind === ShopOfferKind.STUDY_POINTS
        ? SP_SHOP_PRODUCTS_BY_KEY[catalogEntry.productKey]
        : undefined,
  };
};

const cachedOffers: Partial<Record<ShopOfferKindValue, ShopDailyOffer | null | undefined>> = {};

const ensureTodayOfferForKind = async (
  shopKind: ShopOfferKindValue,
): Promise<ShopDailyOffer | null> => {
  const dateKey = getTodayKey();
  const storageKey = buildOfferStorageKey(dateKey, shopKind);
  const existing = await findOfferRecord(dateKey, shopKind);

  if (existing) {
    const enriched = await enrichOffer(existing, shopKind);
    cachedOffers[shopKind] = enriched;
    return enriched;
  }

  if (!shouldHaveOfferToday(dateKey, shopKind)) {
    await ShopOfferRepository.saveNoOffer(storageKey);
    cachedOffers[shopKind] = null;
    return null;
  }

  const rolled = rollOfferForDate(dateKey, shopKind);
  if (!rolled) {
    await ShopOfferRepository.saveNoOffer(storageKey);
    cachedOffers[shopKind] = null;
    return null;
  }

  await ShopOfferRepository.saveOffer({
    dateKey: storageKey,
    catalogOfferId: rolled.catalogOfferId,
    productKey: rolled.productKey,
    discountPercent: rolled.discountPercent,
    offerPrice: rolled.offerPrice,
    originalPrice: rolled.originalPrice,
  });

  cachedOffers[shopKind] = rolled;
  void ShopOfferNotificationService.rescheduleAll();
  return rolled;
};

export const ShopOfferService = {
  getCachedTodayOffer(shopKind: ShopOfferKindValue): ShopDailyOffer | null | undefined {
    return cachedOffers[shopKind];
  },

  async ensureTodayOffers(): Promise<{ coins: ShopDailyOffer | null; studyPoints: ShopDailyOffer | null }> {
    const [coins, studyPoints] = await Promise.all([
      ensureTodayOfferForKind(ShopOfferKind.COINS),
      ensureTodayOfferForKind(ShopOfferKind.STUDY_POINTS),
    ]);
    return { coins, studyPoints };
  },

  async ensureTodayOffer(shopKind: ShopOfferKindValue): Promise<ShopDailyOffer | null> {
    return ensureTodayOfferForKind(shopKind);
  },

  async getTodayOffer(shopKind: ShopOfferKindValue): Promise<ShopDailyOffer | null> {
    if (cachedOffers[shopKind] !== undefined) {
      return cachedOffers[shopKind] ?? null;
    }
    return ensureTodayOfferForKind(shopKind);
  },

  async refresh(): Promise<{ coins: ShopDailyOffer | null; studyPoints: ShopDailyOffer | null }> {
    delete cachedOffers[ShopOfferKind.COINS];
    delete cachedOffers[ShopOfferKind.STUDY_POINTS];
    return ShopOfferService.ensureTodayOffers();
  },

  canAffordOffer(offer: ShopDailyOffer, balance: number): boolean {
    return balance >= offer.offerPrice;
  },

  async purchaseTodayOffer(shopKind: ShopOfferKindValue): Promise<ShopOfferPurchaseResult> {
    const dateKey = getTodayKey();
    const offer = await ShopOfferService.getTodayOffer(shopKind);

    if (!offer || offer.dateKey !== dateKey) {
      return { success: false, reason: ShopOfferFailureReason.NO_OFFER_TODAY };
    }

    if (offer.purchased) {
      return { success: false, reason: ShopOfferFailureReason.ALREADY_PURCHASED };
    }

    if (shopKind === ShopOfferKind.COINS) {
      const result = await ShopService.purchase(offer.productKey, {
        priceOverride: offer.offerPrice,
        offerStorageKey: offer.storageKey,
      });

      if (!result.success) {
        return result;
      }

      await ShopOfferRepository.markPurchased(offer.storageKey);
      cachedOffers[shopKind] = { ...offer, purchased: true };
      void ShopOfferNotificationService.rescheduleAll();

      return {
        success: true,
        offer: cachedOffers[shopKind] as ShopDailyOffer,
        amountSpent: result.coinsSpent,
        quantity: result.quantity,
        currency: ShopOfferKind.COINS,
      };
    }

    const spBalance = await getOrCreateStudyPointsBalance();
    if (spBalance.balance < offer.offerPrice) {
      return { success: false, reason: ShopPurchaseFailureReason.INSUFFICIENT_COINS };
    }

    const success = await StudyPointsService.purchaseShopItem(offer.productKey, {
      priceOverride: offer.offerPrice,
      offerStorageKey: offer.storageKey,
    });

    if (!success) {
      return { success: false, reason: ShopOfferFailureReason.UNAVAILABLE };
    }

    await ShopOfferRepository.markPurchased(offer.storageKey);
    cachedOffers[shopKind] = { ...offer, purchased: true };
    void ShopOfferNotificationService.rescheduleAll();

    return {
      success: true,
      offer: cachedOffers[shopKind] as ShopDailyOffer,
      amountSpent: offer.offerPrice,
      quantity: 1,
      currency: ShopOfferKind.STUDY_POINTS,
    };
  },
};
