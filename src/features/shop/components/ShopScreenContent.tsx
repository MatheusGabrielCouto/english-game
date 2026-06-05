import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Toast } from '@/components';
import { theme } from '@/constants';
import { TutorialGuideCard } from '@/features/tutorial';

import {
    getAvailableShopProducts,
    getPurchasableLootBoxCount,
    getShopCatalogSections,
    getTotalLootBoxCount,
} from '../constants/shop-products';
import { SHOP_TEXT } from '../constants/shop-ui';
import type { UseShopReturn } from '../hooks/use-shop';
import { ShopBalanceCard } from './ShopBalanceCard';
import { ShopCategorySection } from './ShopCategorySection';
import { ShopHistoryList } from './ShopHistoryList';
import { ShopLivingMarketSection } from './ShopLivingMarketSection';
import { ShopSectionHeader } from './ShopSectionHeader';
import { ShopStudyPointsHub } from './ShopStudyPointsHub';

type ShopScreenContentProps = {
  shop: UseShopReturn;
};

const ShopDivider = () => <View className="h-px bg-border/70" />;

export const ShopScreenContent = ({ shop }: ShopScreenContentProps) => {
  const {
    coins,
    studyPointsBalance,
    products,
    spProducts,
    dailyOfferCoins,
    dailyOfferSp,
    stock,
    lootBoxCounts,
    history,
    isLoading,
    toastMessage,
    toastKey,
    toastVariant,
    canAfford,
    canAffordOffer,
    canAffordStock,
    handleSelectProduct,
    handleSelectDailyOffer,
    handleSelectStockItem,
    handleSelectSpProduct,
    handleUpgradeLootBox,
    isPurchasing,
    clearToast,
  } = shop;

  const catalogSections = useMemo(
    () => getShopCatalogSections(products),
    [products],
  );

  const availableCount = useMemo(() => getAvailableShopProducts().length, []);
  const purchasableLootBoxes = getPurchasableLootBoxCount();
  const totalLootBoxes = getTotalLootBoxCount();

  if (isLoading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View className="gap-6 pb-8">
      <ShopBalanceCard
        coins={coins}
        studyPoints={studyPointsBalance}
        productCount={availableCount}
        purchasableLootBoxes={purchasableLootBoxes}
        totalLootBoxes={totalLootBoxes}
      />

      <TutorialGuideCard />

      <ShopLivingMarketSection
        dailyOfferCoins={dailyOfferCoins}
        dailyOfferSp={dailyOfferSp}
        stock={stock}
        canAffordOffer={canAffordOffer}
        canAffordStock={canAffordStock}
        isPurchasing={isPurchasing}
        onPurchaseOffer={handleSelectDailyOffer}
        onPurchaseStock={handleSelectStockItem}
      />

      <ShopDivider />

      <View className="gap-4">
        <ShopSectionHeader
          kicker="🪙 Catálogo permanente"
          kickerClassName={SHOP_TEXT.kickerGold}
          title="Loja de moedas"
          subtitle="Itens sempre disponíveis — fora do estoque rotativo e das ofertas."
        />

        {catalogSections.map((section) => (
          <ShopCategorySection
            key={section.category}
            section={section}
            canAfford={canAfford}
            onPurchase={handleSelectProduct}
          />
        ))}
      </View>

      <ShopDivider />

      <ShopStudyPointsHub
        balance={studyPointsBalance}
        products={spProducts}
        lootBoxCounts={lootBoxCounts}
        isPurchasing={isPurchasing}
        onPurchase={handleSelectSpProduct}
        onUpgrade={handleUpgradeLootBox}
      />

      {history.length > 0 ? <ShopHistoryList history={history} /> : null}

      <Toast
        message={toastMessage}
        variant={toastVariant}
        toastKey={toastKey}
        onDismiss={clearToast}
      />
    </View>
  );
};
