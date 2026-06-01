import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Toast } from '@/components';
import { theme } from '@/constants';
import { TutorialGuideCard } from '@/features/tutorial';

import {
  getAvailableShopProducts,
  getPurchasableLootBoxCount,
  getShopCatalogSections,
  getTotalLootBoxCount,
} from '../constants/shop-products';
import type { UseShopReturn } from '../hooks/use-shop';
import { ShopBalanceCard } from './ShopBalanceCard';
import { ShopCategorySection } from './ShopCategorySection';
import { ShopHistoryList } from './ShopHistoryList';
import { ShopStudyPointsHub } from './ShopStudyPointsHub';

type ShopScreenContentProps = {
  shop: UseShopReturn;
};

export const ShopScreenContent = ({ shop }: ShopScreenContentProps) => {
  const {
    coins,
    studyPointsBalance,
    products,
    spProducts,
    lootBoxCounts,
    history,
    isLoading,
    toastMessage,
    toastKey,
    toastVariant,
    canAfford,
    handleSelectProduct,
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

      <View className="gap-1 px-0.5">
        <Text className="text-xs font-bold uppercase tracking-widest text-gold">🪙 Loja por moedas</Text>
        <Text className="text-sm text-foreground-secondary">Escudos e loot boxes compráveis com moedas.</Text>
      </View>

      {catalogSections.map((section) => (
        <ShopCategorySection
          key={section.category}
          section={section}
          canAfford={canAfford}
          onPurchase={handleSelectProduct}
        />
      ))}

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
