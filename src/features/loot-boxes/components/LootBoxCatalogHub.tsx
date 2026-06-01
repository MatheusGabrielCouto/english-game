import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { LOOT_BOX_CATALOG_META, LOOT_BOX_CATALOG_ORDER } from '@/features/loot-boxes/constants/loot-box-catalog-meta';
import { buildLootBoxCatalogSnapshot } from '@/features/loot-boxes/utils/loot-catalog';
import { useCollectionBookStore } from '@/features/collection-book/store/collection-book-store';

export const LootBoxCatalogHub = () => {
  const collectionEntries = useCollectionBookStore((s) => s.entries);
  const discoveredKeys = useMemo(
    () => new Set(collectionEntries.map((entry) => entry.itemKey)),
    [collectionEntries],
  );

  return (
    <View className="gap-3">
      {LOOT_BOX_CATALOG_ORDER.map((rarity) => {
        const meta = LOOT_BOX_CATALOG_META[rarity];
        const snapshot = buildLootBoxCatalogSnapshot(rarity);
        const obtained = snapshot.eligibleCollectibles.filter((item) => discoveredKeys.has(item.key)).length;
        const total = snapshot.eligibleCollectibles.length;

        return (
          <PressableScale
            key={rarity}
            onPress={() => router.push(`/loot-box-catalog/${rarity}` as Href)}
            accessibilityRole="button"
            accessibilityLabel={`Ver catálogo ${meta.title}`}>
            <Card elevated accent className="px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-black text-foreground">
                    {meta.emoji} {meta.title}
                  </Text>
                  <Text className="mt-1 text-xs text-foreground-secondary">{meta.description}</Text>
                  <Text className="mt-2 text-[10px] font-bold uppercase text-primary">
                    Coleção: {obtained}/{total} · {snapshot.poolEntries.length} tipos de drop
                  </Text>
                </View>
                <Text className="text-2xl text-muted">›</Text>
              </View>
            </Card>
          </PressableScale>
        );
      })}
    </View>
  );
};
