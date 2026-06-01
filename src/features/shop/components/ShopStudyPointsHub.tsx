import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { LOOT_BOX_UPGRADE_CHAIN } from '@/features/game-design/catalogs/loot-economy';
import type { LootBoxRarityValue } from '@/types/inventory';

import type { SpShopProductDisplay } from '../constants/sp-shop-products';
import { SP_SHOP_SECTION } from '../constants/sp-shop-products';
import { ShopLootBoxUpgradeCard } from './ShopLootBoxUpgradeCard';
import { ShopSpProductCard } from './ShopSpProductCard';

type ShopStudyPointsHubProps = {
  balance: number;
  products: SpShopProductDisplay[];
  lootBoxCounts: Record<LootBoxRarityValue, number> | null;
  isPurchasing?: boolean;
  onPurchase: (product: SpShopProductDisplay) => void;
  onUpgrade: (fromRarity: LootBoxRarityValue) => void;
};

export const ShopStudyPointsHub = ({
  balance,
  products,
  lootBoxCounts,
  isPurchasing = false,
  onPurchase,
  onUpgrade,
}: ShopStudyPointsHubProps) => {
  const lootProducts = products.filter((product) => product.detail?.startsWith('Caixa'));
  const specialProducts = products.filter((product) => !product.detail?.startsWith('Caixa'));

  const upgradeSteps = LOOT_BOX_UPGRADE_CHAIN.map((step) => ({
    from: step.from as LootBoxRarityValue,
    to: step.to as LootBoxRarityValue,
    costStudyPoints: step.costStudyPoints,
    ownedCount: lootBoxCounts?.[step.from as LootBoxRarityValue] ?? 0,
  }));

  return (
    <View className="gap-4">
      <View className="h-px bg-border/80" />

      <GameCard variant="quest" glow className="border-accent/25">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-accent">
              {SP_SHOP_SECTION.emoji} {SP_SHOP_SECTION.title}
            </Text>
            <Text className="mt-2 text-sm leading-relaxed text-foreground-secondary">
              Compre loot boxes e itens exclusivos, ou faça upgrade das caixas do inventário.
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-bold uppercase tracking-widest text-muted">Saldo</Text>
            <Text className="mt-1 text-3xl font-black text-accent">{balance.toLocaleString('pt-BR')}</Text>
            <Text className="text-xs font-bold text-accent/80">Study Points</Text>
          </View>
        </View>
      </GameCard>

      <View className="gap-3">
        <Text className="px-0.5 text-xs font-bold uppercase tracking-widest text-muted">
          📦 Loot boxes · SP
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {lootProducts.map((product) => (
            <View key={product.key} className="min-w-[47%] flex-1">
              <ShopSpProductCard
                product={product}
                canAfford={balance >= product.cost}
                onPurchase={onPurchase}
                compact
              />
            </View>
          ))}
        </View>
      </View>

      {specialProducts.length > 0 ? (
        <View className="gap-3">
          <Text className="px-0.5 text-xs font-bold uppercase tracking-widest text-muted">
            ✨ Itens especiais
          </Text>
          <View className="gap-3">
            {specialProducts.map((product) => (
              <ShopSpProductCard
                key={product.key}
                product={product}
                canAfford={balance >= product.cost}
                onPurchase={onPurchase}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <View className="px-0.5">
          <Text className="text-xs font-bold uppercase tracking-widest text-foreground-secondary">
            ⬆️ Upgrade de loot boxes
          </Text>
          <Text className="mt-1 text-sm text-foreground-secondary">
            Gasta SP e transforma uma caixa fechada na raridade seguinte.
          </Text>
        </View>
        <View className="gap-2">
          {upgradeSteps.map((step) => (
            <ShopLootBoxUpgradeCard
              key={`${step.from}-${step.to}`}
              step={step}
              balance={balance}
              isBusy={isPurchasing}
              onUpgrade={onUpgrade}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
