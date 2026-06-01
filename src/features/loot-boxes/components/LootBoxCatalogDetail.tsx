import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { LOOT_BOX_CATALOG_META } from '@/features/loot-boxes/constants/loot-box-catalog-meta';
import {
  buildLootBoxCatalogSnapshot,
  getCollectibleDropChance,
} from '@/features/loot-boxes/utils/loot-catalog';
import { buildCollectionRates } from '@/features/loot-boxes/utils/collection-rates';
import { useCollectionBookStore } from '@/features/collection-book/store/collection-book-store';
import { WishlistToggleButton } from '@/features/wishlist/components/WishlistToggleButton';
import type { LootBoxRarityValue } from '@/types/inventory';
import { cn } from '@/utils';

type LootBoxCatalogDetailProps = {
  rarity: LootBoxRarityValue;
};

export const LootBoxCatalogDetail = ({ rarity }: LootBoxCatalogDetailProps) => {
  const entries = useCollectionBookStore((s) => s.entries);
  const discoveredKeys = new Set(entries.map((entry) => entry.itemKey));
  const meta = LOOT_BOX_CATALOG_META[rarity];
  const snapshot = buildLootBoxCatalogSnapshot(rarity);
  const collectionRates = buildCollectionRates(discoveredKeys);

  const obtained = snapshot.eligibleCollectibles.filter((item) => discoveredKeys.has(item.key));
  const missing = snapshot.eligibleCollectibles.filter((item) => !discoveredKeys.has(item.key));
  const collectionPercent =
    snapshot.eligibleCollectibles.length > 0
      ? Math.round((obtained.length / snapshot.eligibleCollectibles.length) * 100)
      : 0;
  const upgradeDrops = snapshot.poolEntries.filter((entry) => entry.category === 'upgrade');
  const otherDrops = snapshot.poolEntries.filter((entry) => entry.category !== 'upgrade');

  return (
    <View className="gap-5">
      <GameCard variant="reward" glow>
        <Text className="text-xs font-bold uppercase tracking-widest text-gold">
          {meta.emoji} {meta.title}
        </Text>
        <Text className="mt-2 text-sm text-foreground-secondary">{meta.description}</Text>
        <Text className="mt-3 text-3xl font-black text-foreground">{collectionPercent}%</Text>
        <Text className="text-xs text-muted">
          {obtained.length} obtidos · {missing.length} faltando
        </Text>
        <View className="mt-3">
          <ProgressBar value={collectionPercent} variant="gold" height="md" showLabel />
        </View>
      </GameCard>

      <Card elevated>
        <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Taxa de Coleção
        </Text>
        <View className="gap-2">
          {collectionRates.map((row) => (
            <View key={row.key} className="flex-row items-center justify-between">
              <Text className="text-xs text-foreground-secondary">
                {row.emoji} {row.label}
              </Text>
              <Text className="text-xs font-bold text-foreground">
                {row.discovered} / {row.total}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {upgradeDrops.length > 0 ? (
        <Card elevated className="border-accent/30">
          <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
            ⬆️ Upgrade de caixa (drop)
          </Text>
          <View className="gap-2">
            {upgradeDrops.map((entry) => (
              <View
                key={entry.key}
                className="flex-row items-center justify-between rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                <Text className="flex-1 text-xs font-medium text-foreground">{entry.label}</Text>
                <Text className="text-xs font-bold text-accent">{entry.chancePercent}%</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      <Card elevated accent>
        <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
          Chances de Drop (pool principal)
        </Text>
        <View className="gap-2">
          {otherDrops.map((entry) => (
            <View key={entry.key} className="flex-row items-center justify-between rounded-lg bg-surface px-3 py-2">
              <Text className="flex-1 text-xs text-foreground">{entry.label}</Text>
              <Text className="text-xs font-bold text-gold">{entry.chancePercent}%</Text>
            </View>
          ))}
        </View>
      </Card>

      {meta.highlightCategories.map((category) => (
        <Card key={category.key} elevated>
          <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
            {category.emoji} {category.label}
          </Text>
          {category.key === 'collectibles' || category.key === 'relics' || category.key === 'pets' ||
          category.key === 'cosmetics' || category.key === 'legendary' || category.key === 'mythic' ||
          category.key === 'ultra_rare' || category.key === 'endgame' || category.key === 'ancient' ? (
            <CollectibleGrid
              items={snapshot.eligibleCollectibles}
              discoveredKeys={discoveredKeys}
              boxRarity={rarity}
            />
          ) : (
            <View className="gap-2">
              {snapshot.poolEntries
                .filter((entry) => entry.category === category.key || category.key === 'consumables')
                .map((entry) => (
                  <View key={entry.key} className="flex-row justify-between">
                    <Text className="text-xs text-foreground">{entry.label}</Text>
                    <Text className="text-xs font-bold text-muted">{entry.chancePercent}%</Text>
                  </View>
                ))}
            </View>
          )}
        </Card>
      ))}

      <Card elevated>
        <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-success">
          ✅ Obtidos ({obtained.length})
        </Text>
        {obtained.length === 0 ? (
          <Text className="text-xs text-muted">Nenhum item desta caixa coletado ainda.</Text>
        ) : (
          <CollectibleGrid items={obtained} discoveredKeys={discoveredKeys} boxRarity={rarity} compact />
        )}
      </Card>

      <Card elevated>
        <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
          ❓ Faltando ({missing.length})
        </Text>
        {missing.length === 0 ? (
          <Text className="text-xs text-success">Coleção completa desta caixa! 🎉</Text>
        ) : (
          <CollectibleGrid items={missing} discoveredKeys={discoveredKeys} boxRarity={rarity} compact />
        )}
      </Card>
    </View>
  );
};

type CollectibleGridProps = {
  items: ReturnType<typeof buildLootBoxCatalogSnapshot>['eligibleCollectibles'];
  discoveredKeys: Set<string>;
  boxRarity: LootBoxRarityValue;
  compact?: boolean;
};

const CollectibleGrid = ({ items, discoveredKeys, boxRarity, compact = false }: CollectibleGridProps) => (
  <View className="flex-row flex-wrap gap-2">
    {items.slice(0, compact ? items.length : 24).map((item) => {
      const discovered = discoveredKeys.has(item.key);
      const dropChance = getCollectibleDropChance(boxRarity, item.rarity);

      return (
        <View
          key={item.key}
          className={cn(
            'w-[30%] min-w-[96px] rounded-xl border px-2 py-2',
            discovered ? 'border-gold/40 bg-gold/10' : 'border-border bg-surface opacity-50',
          )}>
          <Text className="text-center text-xl">{discovered ? item.icon : '❓'}</Text>
          <Text className="mt-1 text-center text-[9px] font-bold text-foreground" numberOfLines={2}>
            {discovered ? item.name : '???'}
          </Text>
          {discovered ? (
            <Text className="text-center text-[8px] text-muted">~{dropChance}%</Text>
          ) : null}
          <View className="mt-1 items-center">
            <WishlistToggleButton itemKey={item.key} size="sm" />
          </View>
        </View>
      );
    })}
    {!compact && items.length > 24 ? (
      <Text className="w-full text-center text-[10px] text-muted">+{items.length - 24} itens</Text>
    ) : null}
  </View>
);
