import { PET_COSMETICS_BY_KEY, PET_COSMETICS_CATALOG } from '@/features/pet/catalogs/pet-cosmetics-catalog';
import { GameEvents } from '@/services/game-events';
import { PetCosmeticInventoryRepository } from '@/storage/repositories/pet-cosmetic-inventory-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import type { PetCosmeticSlot, PetEquippedCosmetics } from '@/types/pet-expansion';
import type { PetCosmeticInventoryEntry } from '@/types/pet-cosmetic-inventory';

import { serializeEquippedCosmetics } from '../utils/pet-equipped-cosmetics';

const pickRandomCosmetic = (minRarity: 'common' | 'rare' | 'epic' = 'common'): string => {
  const order = ['common', 'rare', 'epic', 'legendary'];
  const minIndex = order.indexOf(minRarity);
  const pool = PET_COSMETICS_CATALOG.filter(
    (c) => order.indexOf(c.rarity) >= minIndex,
  );
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? PET_COSMETICS_CATALOG[0];
  return pick.key;
};

export const PetCosmeticService = {
  async listInventory(instanceId: number): Promise<PetCosmeticInventoryEntry[]> {
    return PetCosmeticInventoryRepository.listForInstance(instanceId);
  },

  async grantRandom(instanceId: number, source: string, minRarity?: 'common' | 'rare' | 'epic') {
    const key = pickRandomCosmetic(minRarity);
    const granted = await PetCosmeticInventoryRepository.grant({
      instanceId,
      cosmeticKey: key,
      source,
    });
    if (!granted) return null;

    const def = PET_COSMETICS_BY_KEY[key];
    GameEvents.emit({
      type: 'PET_COSMETIC_GRANTED',
      instanceId,
      cosmeticKey: key,
      source,
    });

    return def ?? { key, name: key, icon: '✨', slot: 'hat' as PetCosmeticSlot, rarity: 'common', minStage: 'egg' };
  },

  async equip(
    instanceId: number,
    cosmeticKey: string,
  ): Promise<{ ok: boolean; message: string }> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };

    const owns = await PetCosmeticInventoryRepository.has(instanceId, cosmeticKey);
    if (!owns) return { ok: false, message: 'Cosmético não desbloqueado.' };

    const def = PET_COSMETICS_BY_KEY[cosmeticKey];
    if (!def) return { ok: false, message: 'Cosmético inválido.' };

    const next: PetEquippedCosmetics = { ...instance.equippedCosmetics, [def.slot]: cosmeticKey };
    instance.equippedCosmetics = next;
    await PetInstanceRepository.update(instance);

    if (instance.isActive) {
      const pet = await getOrCreatePet();
      await savePet({
        ...pet,
        equippedCosmeticsJson: serializeEquippedCosmetics(next),
        updatedAt: new Date().toISOString(),
      });
    }

    GameEvents.emit({
      type: 'PET_COSMETIC_EQUIPPED',
      instanceId,
      cosmeticKey,
      slot: def.slot,
    });

    return { ok: true, message: `${def.name} equipado!` };
  },

  async unequip(
    instanceId: number,
    slot: PetCosmeticSlot,
  ): Promise<{ ok: boolean; message: string }> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };

    const next = { ...instance.equippedCosmetics };
    delete next[slot];
    instance.equippedCosmetics = next;
    await PetInstanceRepository.update(instance);

    if (instance.isActive) {
      const pet = await getOrCreatePet();
      await savePet({
        ...pet,
        equippedCosmeticsJson: serializeEquippedCosmetics(next),
        updatedAt: new Date().toISOString(),
      });
    }

    return { ok: true, message: 'Cosmético removido.' };
  },
};

export const grantLeagueSilverCosmetic = async (instanceId: number): Promise<void> => {
  await PetCosmeticService.grantRandom(instanceId, 'league_silver', 'rare');
};
