import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { PET_COSMETICS_BY_KEY } from '@/features/pet/catalogs/pet-cosmetics-catalog';
import type { PetCosmeticSlot } from '@/types/pet-expansion';
import type { PetInstance } from '@/types/pet-instance';
import type { PetCosmeticInventoryEntry } from '@/types/pet-cosmetic-inventory';
import { cn } from '@/utils';

import { PET_COSMETIC_UI } from '../constants/pet-hall-ui';
import { PetCosmeticService } from '../services/pet-cosmetic-service';
import { PetFarmEmptyState } from './PetFarmUiKit';

const SLOT_LABELS: Record<PetCosmeticSlot, string> = {
  hat: 'Chapéu',
  glasses: 'Óculos',
  backpack: 'Mochila',
  outfit: 'Roupa',
  skin: 'Skin',
};

const EQUIPPED_BG: ViewStyle = { backgroundColor: 'rgba(34, 197, 94, 0.12)' };

type PetInstanceCosmeticsTabProps = {
  instance: PetInstance;
  onChanged: (message: string) => void;
};

export const PetInstanceCosmeticsTab = ({ instance, onChanged }: PetInstanceCosmeticsTabProps) => {
  const [inventory, setInventory] = useState<PetCosmeticInventoryEntry[]>([]);

  const refresh = useCallback(async () => {
    setInventory(await PetCosmeticService.listInventory(instance.id));
  }, [instance.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const bySlot = useMemo(() => {
    const map = new Map<PetCosmeticSlot, PetCosmeticInventoryEntry[]>();
    for (const entry of inventory) {
      const def = PET_COSMETICS_BY_KEY[entry.cosmeticKey];
      if (!def) continue;
      const list = map.get(def.slot) ?? [];
      list.push(entry);
      map.set(def.slot, list);
    }
    return map;
  }, [inventory]);

  const handleEquip = async (cosmeticKey: string) => {
    const result = await PetCosmeticService.equip(instance.id, cosmeticKey);
    onChanged(result.message);
    await refresh();
  };

  const handleUnequip = async (slot: PetCosmeticSlot) => {
    const result = await PetCosmeticService.unequip(instance.id, slot);
    onChanged(result.message);
    await refresh();
  };

  if (inventory.length === 0) {
    return (
      <PetFarmEmptyState
        emoji="🎨"
        title={PET_COSMETIC_UI.empty}
        subtitle={PET_COSMETIC_UI.emptyHint}
      />
    );
  }

  return (
    <View className="gap-3">
      <Text className="text-[10px] text-muted">{PET_COSMETIC_UI.hint}</Text>
      {([...bySlot.entries()] as [PetCosmeticSlot, PetCosmeticInventoryEntry[]][]).map(
        ([slot, entries]) => {
          const equippedKey = instance.equippedCosmetics[slot];
          return (
            <View key={slot} className="gap-2 rounded-2xl border border-border bg-surface p-3">
              <Text className="text-xs font-bold text-foreground">
                {PET_COSMETIC_UI.slotLabel(SLOT_LABELS[slot])}
              </Text>
              {entries.map((entry) => {
                const def = PET_COSMETICS_BY_KEY[entry.cosmeticKey];
                if (!def) return null;
                const equipped = equippedKey === entry.cosmeticKey;
                return (
                  <View
                    key={entry.cosmeticKey}
                    className={cn(
                      'flex-row items-center gap-3 rounded-xl border border-border p-2.5',
                      equipped && 'border-emerald-500/40',
                    )}
                    style={equipped ? EQUIPPED_BG : undefined}>
                    <Text className="text-xl">{def.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-foreground">{def.name}</Text>
                      <Text className="text-[10px] capitalize text-muted">{def.rarity}</Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        void (equipped ? handleUnequip(slot) : handleEquip(entry.cosmeticKey))
                      }
                      accessibilityRole="button"
                      className="rounded-lg border border-border px-2.5 py-1.5">
                      <Text className="text-[10px] font-bold text-foreground">
                        {equipped ? PET_COSMETIC_UI.unequip : PET_COSMETIC_UI.equip}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          );
        },
      )}
    </View>
  );
};
