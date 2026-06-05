import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import {
    ShopOfferPurchaseModal,
    ShopPurchaseModal,
    ShopScreenContent,
    ShopSpPurchaseModal,
    ShopStockPurchaseModal,
    useShop,
    useShopScreenStore,
} from '@/features/shop';

export default function ShopScreen() {
  const shop = useShop();
  const setSelectedProduct = useShopScreenStore((state) => state.setSelectedProduct);
  const setSelectedDailyOffer = useShopScreenStore((state) => state.setSelectedDailyOffer);
  const setSelectedStockItem = useShopScreenStore((state) => state.setSelectedStockItem);
  const setSelectedSpProduct = useShopScreenStore((state) => state.setSelectedSpProduct);
  const setIsPurchasing = useShopScreenStore((state) => state.setIsPurchasing);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedProduct(null);
        setSelectedDailyOffer(null);
        setSelectedStockItem(null);
        setSelectedSpProduct(null);
        setIsPurchasing(false);
      };
    }, [
      setIsPurchasing,
      setSelectedDailyOffer,
      setSelectedStockItem,
      setSelectedProduct,
      setSelectedSpProduct,
    ]),
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer scrollable>
        <ScreenHeader showBack title="Loja" subtitle="Moedas, Study Points e upgrades" emoji="🛒" />
        <ShopScreenContent shop={shop} />
      </ScreenContainer>
      <ShopPurchaseModal shop={shop} />
      <ShopOfferPurchaseModal shop={shop} />
      <ShopStockPurchaseModal shop={shop} />
      <ShopSpPurchaseModal
        product={shop.selectedSpProduct}
        balance={shop.studyPointsBalance}
        isPurchasing={shop.isPurchasing}
        onCancel={shop.handleCancelSpPurchase}
        onConfirm={() => void shop.handleConfirmSpPurchase()}
      />
    </View>
  );
}
