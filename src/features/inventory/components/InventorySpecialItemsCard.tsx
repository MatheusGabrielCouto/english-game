import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import { showGameToast } from '@/features/feedback/services/feedback-service';
import {
    isItemUsable,
    resolveGameItem,
} from '@/features/game-design/catalogs/item-catalog';
import { BoosterModifierCache } from '@/features/game-design/services/booster-modifier-cache';
import type { SpecialItemRecord } from '@/types/inventory';

import { ConsumableItemService } from '../services/consumable-item-service';
import { InventoryItemSlot } from './InventoryItemSlot';
import { InventorySectionHeader } from './InventorySectionHeader';
import { UseConsumableModal } from './UseConsumableModal';

type InventorySpecialItemsCardProps = {
  items: SpecialItemRecord[];
};

export const InventorySpecialItemsCard = ({ items }: InventorySpecialItemsCardProps) => {
  const [selected, setSelected] = useState<SpecialItemRecord | null>(null);
  const [isUsing, setIsUsing] = useState(false);
  const [boosterRevision, setBoosterRevision] = useState(0);

  const activeBoosters = useMemo(
    () => BoosterModifierCache.getSync().active,
    [boosterRevision],
  );

  const handleClose = useCallback(() => {
    if (isUsing) return;
    setSelected(null);
  }, [isUsing]);

  const handleConfirmUse = useCallback(async () => {
    if (!selected || isUsing) return;

    setIsUsing(true);
    const result = await ConsumableItemService.use(selected.itemKey);
    setIsUsing(false);

    if (!result.ok) {
      showGameToast(result.message, 'warning');
      return;
    }

    await BoosterModifierCache.refresh();
    setBoosterRevision((v) => v + 1);
    setSelected(null);
  }, [selected, isUsing]);

  if (items.length === 0 && activeBoosters.length === 0) return null;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View className="gap-3">
      <InventorySectionHeader
        emoji="✨"
        title="Itens Especiais"
        subtitle="Toque para usar boosters, tickets e consumíveis"
        badge={`${totalQuantity} un.`}
      />

      {activeBoosters.length > 0 ? (
        <GameCard variant="default" className="gap-2 p-3">
          <Text className="text-xs font-bold uppercase tracking-wide text-gold">Boosters ativos</Text>
          {activeBoosters.map((booster) => {
            const minsLeft = Math.max(
              0,
              Math.round((new Date(booster.expiresAt).getTime() - Date.now()) / 60_000),
            );
            return (
              <View
                key={booster.boosterKey}
                className="flex-row items-center justify-between rounded-lg border border-gold/30 bg-gold/5 px-3 py-2"
              >
                <View className="flex-row items-center gap-2">
                  <Text>{booster.icon}</Text>
                  <Text className="text-sm font-semibold text-foreground">{booster.name}</Text>
                </View>
                <Text className="text-xs text-muted">{minsLeft > 0 ? `${minsLeft} min` : 'ativo'}</Text>
              </View>
            );
          })}
        </GameCard>
      ) : null}

      {items.length > 0 ? (
        <GameCard variant="reward" className="p-4">
          <View className="flex-row flex-wrap gap-3">
            {items.map((item) => {
              const def = resolveGameItem(item.itemKey);
              const usable = isItemUsable(item.itemKey);

              return (
                <View key={item.id} className="w-[88px]">
                  <InventoryItemSlot
                    emoji={def?.icon ?? '✨'}
                    label={def?.name ?? item.itemKey}
                    sublabel={usable ? 'Toque para usar' : 'Colecionável'}
                    quantity={item.quantity}
                    borderClass="border-gold/40 bg-gold/5"
                    highlighted={usable}
                    size="sm"
                    onPress={usable ? () => setSelected(item) : undefined}
                    accessibilityLabel={
                      usable ? `Usar ${def?.name ?? item.itemKey}` : def?.name ?? item.itemKey
                    }
                  />
                </View>
              );
            })}
          </View>
        </GameCard>
      ) : null}

      <UseConsumableModal
        item={selected}
        visible={selected != null}
        isUsing={isUsing}
        onClose={handleClose}
        onConfirm={() => void handleConfirmUse()}
      />
    </View>
  );
};
