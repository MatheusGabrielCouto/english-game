import { getTodayKey } from '@/features/quests/utils/date';
import { getWeekBounds } from '@/features/weekly-quests/utils/week';
import type { ShopOfferKindValue } from '@/types/shop-offer';
import type { ShopStockPeriodValue } from '@/types/shop-stock';
import { ShopStockPeriod } from '@/types/shop-stock';

export const DAILY_STOCK_SLOTS_PER_SHOP = 3;
export const WEEKLY_STOCK_SLOTS_PER_SHOP = 2;

export const getStockPeriodKey = (period: ShopStockPeriodValue): string =>
  period === ShopStockPeriod.DAILY
    ? getTodayKey()
    : getWeekBounds().weekStartDate;

export const buildStockStorageKey = (
  periodKey: string,
  period: ShopStockPeriodValue,
  shopKind: ShopOfferKindValue,
  slotIndex: number,
): string => `${periodKey}:${period}:${shopKind}:${slotIndex}`;
