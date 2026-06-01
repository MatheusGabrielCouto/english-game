import { ActivityIndicator, View } from 'react-native';

import { theme } from '@/constants';

import { useInventory } from '../hooks/use-inventory';
import { InventoryHeroCard } from './InventoryHeroCard';
import { InventoryHistoryList } from './InventoryHistoryList';
import { InventoryLootBoxCard } from './InventoryLootBoxCard';
import { InventoryPetCard } from './InventoryPetCard';
import { InventoryShieldCard } from './InventoryShieldCard';
import { InventorySpecialItemsCard } from './InventorySpecialItemsCard';

export const InventoryScreenContent = () => {
  const { snapshot, history, isLoading } = useInventory();

  if (isLoading || !snapshot) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const specialItemsCount = snapshot.specialItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <View className="gap-6 pb-4">
      <InventoryHeroCard
        shields={snapshot.shields.quantity}
        lootBoxes={snapshot.lootBoxes.total}
        specialItems={specialItemsCount}
        analytics={snapshot.analytics}
      />

      <InventoryShieldCard quantity={snapshot.shields.quantity} />
      <InventoryLootBoxCard lootBoxes={snapshot.lootBoxes} />
      <InventoryPetCard pet={snapshot.pet} />
      <InventorySpecialItemsCard items={snapshot.specialItems} />
      <InventoryHistoryList history={history} />
    </View>
  );
};
