import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import {
    ShopPurchaseModal,
    ShopScreenContent,
    ShopSpPurchaseModal,
    useShop,
    useShopScreenStore,
} from '@/features/shop';

export default function ShopScreen() {
  const shop = useShop();
  const setSelectedProduct = useShopScreenStore((state) => state.setSelectedProduct);
  const setSelectedSpProduct = useShopScreenStore((state) => state.setSelectedSpProduct);
  const setIsPurchasing = useShopScreenStore((state) => state.setIsPurchasing);
  const clearToast = useShopScreenStore((state) => state.clearToast);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedProduct(null);
        setSelectedSpProduct(null);
        setIsPurchasing(false);
        clearToast();
      };
    }, [clearToast, setIsPurchasing, setSelectedProduct, setSelectedSpProduct]),
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer scrollable>
        <ScreenHeader title="Loja" subtitle="Moedas, Study Points e upgrades" emoji="🛒" />
        <ShopScreenContent shop={shop} />
      </ScreenContainer>
      <ShopPurchaseModal shop={shop} />
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
