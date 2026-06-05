import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getTodayKey } from '@/features/quests/utils/date';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';
import { ShopOfferKind } from '@/types/shop-offer';

import { ShopOfferService } from './shop-offer-service';
import { ShopStockService } from './shop-stock-service';

const SHOP_OFFER_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-shop-offer-`;

const shopOfferNotificationId = (storageKey: string) => `${SHOP_OFFER_PREFIX}${storageKey}`;

export const ShopOfferNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.shopOfferReminder) return;

    await cancelNotificationsByPrefix(SHOP_OFFER_PREFIX);

    const [coinsOffer, spOffer, stock] = await Promise.all([
      ShopOfferService.getTodayOffer(ShopOfferKind.COINS),
      ShopOfferService.getTodayOffer(ShopOfferKind.STUDY_POINTS),
      ShopStockService.getCachedSnapshot() ?? ShopStockService.ensureStock(),
    ]);

    const activeOffers = [coinsOffer, spOffer].filter(
      (offer): offer is NonNullable<typeof offer> => offer != null && !offer.purchased,
    );

    const stockItems = [
      ...stock.daily.coins,
      ...stock.daily.studyPoints,
      ...stock.weekly.coins,
      ...stock.weekly.studyPoints,
    ].filter((item) => item.stockRemaining > 0);

    if (activeOffers.length === 0 && stockItems.length === 0) return;

    const trigger = new Date();
    trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setMinutes(trigger.getMinutes() + 2);
    }

    const notifications = activeOffers.map((offer) =>
      scheduleLocalNotification({
        identifier: shopOfferNotificationId(offer.storageKey),
        triggerDate: trigger,
        candidate: {
          category: NotificationCategory.SHOP_OFFER,
          title:
            offer.shopKind === ShopOfferKind.COINS
              ? 'Oferta na loja de moedas'
              : 'Oferta na loja de Study Points',
          body: `${offer.merchantEmoji} ${offer.merchantName}: "${offer.title}" — abra a loja e leia a história de hoje!`,
          priority: 4,
        },
      }),
    );

    if (stockItems.length > 0) {
      const todayKey = getTodayKey();
      notifications.push(
        scheduleLocalNotification({
          identifier: shopOfferNotificationId(`${todayKey}:stock-refresh`),
          triggerDate: trigger,
          candidate: {
            category: NotificationCategory.SHOP_OFFER,
            title: 'Estoque renovado na loja',
            body: `A loja viva tem ${stockItems.length} itens com estoque limitado — diário e semanal. Corra antes que esgote!`,
            priority: 4,
          },
        }),
      );
    }

    await Promise.all(notifications);
  },
};
