import { getTodayKey } from '@/features/quests/utils/date';
import type { ShopOfferKindValue } from '@/types/shop-offer';

export const buildOfferStorageKey = (dateKey: string, shopKind: ShopOfferKindValue): string =>
  `${dateKey}:${shopKind}`;

export const getTodayOfferStorageKey = (shopKind: ShopOfferKindValue): string =>
  buildOfferStorageKey(getTodayKey(), shopKind);
