import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { InventoryLootBoxSnapshot } from '@/types/inventory';
import { LootBoxRarity } from '@/types/inventory';

import { LOOT_BOX_RARITY_CONFIG, LOOT_BOX_RARITY_ORDER } from '../constants';
import { InventoryItemSlot } from './InventoryItemSlot';
import { InventorySectionHeader } from './InventorySectionHeader';

type InventoryLootBoxCardProps = {
  lootBoxes: InventoryLootBoxSnapshot;
  hideHeader?: boolean;
};

export const InventoryLootBoxCard = ({ lootBoxes, hideHeader = false }: InventoryLootBoxCardProps) => {
  const handleOpenLootBoxes = () => {
    router.push('/loot-boxes' as Href);
  };

  const filledRarities = LOOT_BOX_RARITY_ORDER.filter(
    (rarity) => lootBoxes.byRarity[rarity] > 0,
  );

  return (
    <View className="gap-3">
      {hideHeader ? null : (
        <InventorySectionHeader
          emoji="📦"
          title="Loot Boxes"
          subtitle={
            lootBoxes.total > 0
              ? 'Toque em uma caixa ou abra todas de uma vez'
              : 'Caixas de recompensa aparecem aqui'
          }
          badge={lootBoxes.total > 0 ? `${lootBoxes.total} fechadas` : undefined}
        />
      )}

      {lootBoxes.total > 0 ? (
        <Button
          label="Abrir Loot Boxes"
          onPress={handleOpenLootBoxes}
          accessibilityLabel="Abrir loot boxes"
        />
      ) : null}

      <GameCard variant="reward" className="p-4">
        {lootBoxes.total === 0 ? (
          <View className="items-center gap-3 py-4">
            <View className="flex-row gap-3 opacity-40">
              <View className="h-16 w-16 rounded-xl border-2 border-dashed border-border bg-surface" />
              <View className="h-16 w-16 rounded-xl border-2 border-dashed border-border bg-surface" />
              <View className="h-16 w-16 rounded-xl border-2 border-dashed border-border bg-surface" />
            </View>
            <Text className="text-center text-sm text-muted">
              Nenhuma caixa no inventário. Complete missões ou visite a loja.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {filledRarities.map((rarity) => {
              const config = LOOT_BOX_RARITY_CONFIG[rarity];
              const count = lootBoxes.byRarity[rarity];

              return (
                <View key={rarity} className="w-[88px]">
                  <InventoryItemSlot
                    emoji={config.emoji}
                    label={config.label}
                    quantity={count}
                    borderClass={config.slotBorderClass}
                    onPress={handleOpenLootBoxes}
                    accessibilityLabel={`Abrir ${count} loot box ${config.label}`}
                    size="sm"
                    highlighted={
                      rarity === LootBoxRarity.LEGENDARY ||
                      rarity === LootBoxRarity.EPIC ||
                      rarity === LootBoxRarity.ANCIENT
                    }
                  />
                </View>
              );
            })}
          </View>
        )}
      </GameCard>
    </View>
  );
};
