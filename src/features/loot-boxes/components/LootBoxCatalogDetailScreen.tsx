import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { LOOT_BOX_CATALOG_META } from '@/features/loot-boxes/constants/loot-box-catalog-meta';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';

import { LootBoxCatalogDetail } from './LootBoxCatalogDetail';

const isValidRarity = (value: string): value is LootBoxRarityValue =>
  Object.values(LootBoxRarity).includes(value as LootBoxRarityValue);

export const LootBoxCatalogDetailScreen = () => {
  const { rarity } = useLocalSearchParams<{ rarity: string }>();
  const boxRarity = rarity && isValidRarity(rarity) ? rarity : LootBoxRarity.COMMON;
  const meta = LOOT_BOX_CATALOG_META[boxRarity];

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={meta.title} subtitle="Transparência total de drops" emoji={meta.emoji} />
      <View className="pt-2">
        <LootBoxCatalogDetail rarity={boxRarity} />
      </View>
    </ScreenContainer>
  );
};
