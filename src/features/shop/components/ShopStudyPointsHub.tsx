import { Text, View } from 'react-native';

import { GameCard, GameDisplayText } from '@/components/ui/game';
import { LOOT_BOX_UPGRADE_CHAIN } from '@/features/game-design/catalogs/loot-economy';
import type { LootBoxRarityValue } from '@/types/inventory';

import { SHOP_TEXT } from '../constants/shop-ui';
import type { SpShopProductDisplay } from '../constants/sp-shop-products';
import { SP_SHOP_SECTION } from '../constants/sp-shop-products';
import { ShopLootBoxUpgradeCard } from './ShopLootBoxUpgradeCard';
import { ShopSectionHeader } from './ShopSectionHeader';
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
  const boosterProducts = products.filter((product) => product.detail === 'Booster');
  const specialProducts = products.filter(
    (product) =>
      !product.detail?.startsWith('Caixa') && product.detail !== 'Booster',
  );

  const upgradeSteps = LOOT_BOX_UPGRADE_CHAIN.map((step) => ({
    from: step.from as LootBoxRarityValue,
    to: step.to as LootBoxRarityValue,
    costStudyPoints: step.costStudyPoints,
    ownedCount: lootBoxCounts?.[step.from as LootBoxRarityValue] ?? 0,
  }));

  return (
    <View className="gap-4">
      <GameCard variant="quest" glow className="border-accent/30">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className={SHOP_TEXT.kickerAccent}>
              {SP_SHOP_SECTION.emoji} {SP_SHOP_SECTION.title}
            </Text>
            <Text className={`mt-2 ${SHOP_TEXT.body}`}>{SP_SHOP_SECTION.subtitle}</Text>
          </View>
          <View className="items-end">
            <Text className={SHOP_TEXT.caption}>Saldo</Text>
            <GameDisplayText variant="hero" className="mt-1 text-3xl leading-none text-accent">
              {balance.toLocaleString('pt-BR')}
            </GameDisplayText>
            <Text className={SHOP_TEXT.kickerAccent}>Study Points</Text>
          </View>
        </View>
      </GameCard>

      <ShopSectionHeader
        kicker="⚡ Catálogo permanente"
        kickerClassName={SHOP_TEXT.kickerAccent}
        title="Loja de Study Points"
        subtitle="Itens fixos fora do estoque rotativo — loot boxes, boosters e especiais."
      />

      <View className="gap-3">
        <Text className={SHOP_TEXT.caption}>📦 Loot boxes</Text>
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

      {boosterProducts.length > 0 ? (
        <View className="gap-3">
          <Text className={SHOP_TEXT.caption}>⚡ Boosters</Text>
          <View className="gap-3">
            {boosterProducts.map((product) => (
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

      {specialProducts.length > 0 ? (
        <View className="gap-3">
          <Text className={SHOP_TEXT.caption}>✨ Itens especiais</Text>
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
        <ShopSectionHeader
          kicker="⬆️ Upgrade"
          title="Evoluir loot boxes"
          subtitle="Gasta SP e transforma uma caixa fechada na raridade seguinte."
        />
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
