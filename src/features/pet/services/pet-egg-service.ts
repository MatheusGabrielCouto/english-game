import {
    PET_SPECIES_BY_KEY,
    PET_SPECIES_CATALOG,
    type PetSpeciesDefinition,
} from '@/features/game-design/catalogs/pet-species-catalog';
import type { UseConsumableResult } from '@/features/inventory/services/consumable-item-service';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { GameEvents } from '@/services/game-events';
import { InventorySpecialItemRepository } from '@/storage/repositories/inventory-special-item-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { PetMood, PetRarity, PetStage, type Pet, type PetRarityValue } from '@/types/pet';

import { PetRosterService } from '@/features/pet-farm/services/pet-roster-service';
import { PetStatsService } from '@/features/pet-farm/services/pet-stats-service';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';

import { PetCollectionService } from './pet-collection-service';
import { PetEggHatchNotificationService } from './pet-egg-hatch-notification-service';
import { PetService } from './pet-service';

const PET_EGG_ITEM_KEYS = new Set(['pet_egg', 'ovo_pet']);

const RARITY_WEIGHT: Record<PetRarityValue, number> = {
  [PetRarity.COMMON]: 48,
  [PetRarity.RARE]: 28,
  [PetRarity.EPIC]: 16,
  [PetRarity.LEGENDARY]: 8,
};

const pickWeightedSpecies = (pool: PetSpeciesDefinition[]): PetSpeciesDefinition => {
  const total = pool.reduce((sum, species) => sum + (RARITY_WEIGHT[species.rarity] ?? 1), 0);
  let roll = Math.random() * total;

  for (const species of pool) {
    roll -= RARITY_WEIGHT[species.rarity] ?? 1;
    if (roll <= 0) return species;
  }

  return pool[pool.length - 1];
};

const pickSpeciesForEgg = async (currentSpeciesKey: string): Promise<PetSpeciesDefinition> => {
  const collection = await PetCollectionService.getCollection(await getOrCreatePet());
  const undiscovered = PET_SPECIES_CATALOG.filter(
    (species) =>
      species.key !== currentSpeciesKey &&
      !collection.find((entry) => entry.speciesKey === species.key)?.discovered,
  );

  const pool =
    undiscovered.length > 0
      ? undiscovered
      : PET_SPECIES_CATALOG.filter((species) => species.key !== currentSpeciesKey);

  if (pool.length === 0) {
    return PET_SPECIES_BY_KEY[currentSpeciesKey] ?? PET_SPECIES_CATALOG[0];
  }

  return pickWeightedSpecies(pool);
};

const formatHatchEta = (hatchAt: string): string => {
  const msLeft = new Date(hatchAt).getTime() - Date.now();
  if (msLeft <= 0) return 'em breve';

  const hours = Math.ceil(msLeft / (60 * 60 * 1000));
  if (hours < 24) return `em ~${hours}h`;
  const days = Math.ceil(hours / 24);
  return `em ~${days} dia${days === 1 ? '' : 's'}`;
};

export const PetEggService = {
  isPetEggItem(itemKey: string): boolean {
    return PET_EGG_ITEM_KEYS.has(itemKey);
  },

  async use(itemKey: string): Promise<UseConsumableResult> {
    if (!PET_EGG_ITEM_KEYS.has(itemKey)) {
      return { ok: false, message: 'Item inválido.' };
    }

    const row = await InventorySpecialItemRepository.findByItemKey(itemKey);
    if (!row || row.quantity < 1) {
      return { ok: false, message: 'Você não tem este ovo no inventário.' };
    }

    const pet = await getOrCreatePet();

    if (
      pet.isIncubating &&
      pet.hatchAt &&
      new Date(pet.hatchAt).getTime() > Date.now()
    ) {
      return {
        ok: false,
        message: `Seu pet já está incubando. Eclosão ${formatHatchEta(pet.hatchAt)}.`,
      };
    }

    const species = await pickSpeciesForEgg(pet.speciesKey);
    const hatchAt = new Date(Date.now() + species.hatchHours * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const updatedPet: Pet = {
      ...pet,
      speciesKey: species.key,
      name: species.name,
      stage: PetStage.EGG,
      level: 1,
      experience: 0,
      mood: PetMood.HAPPY,
      isIncubating: true,
      hatchAt,
      energy: 100,
      hunger: 100,
      happiness: 100,
      motivation: 100,
      updatedAt: now,
    };

    await savePet(updatedPet);
    PetService.setCachedPet(updatedPet);
    await PetRosterService.ensureInitialized();
    const active = await PetInstanceRepository.findActive();
    if (active) {
      active.speciesKey = species.key;
      active.nickname = species.name;
      active.stage = PetStage.EGG;
      active.stats = PetStatsService.rollInitialStats(species.key);
      active.gender = PetStatsService.rollGender();
      await PetInstanceRepository.update(active);
    }
    await PetCollectionService.reconcilePrematureDiscovery(updatedPet);

    const consumed = await InventorySpecialItemRepository.consumeOne(itemKey);
    if (!consumed) {
      return { ok: false, message: 'Não foi possível consumir o ovo.' };
    }

    await InventoryService.refresh();

    await PetEggHatchNotificationService.schedule(updatedPet);

    GameEvents.emit({
      type: 'PET_EGG_USED',
      speciesKey: species.key,
      hatchAt,
    });

    return {
      ok: true,
      message: `${species.emoji} ${species.name} está incubando! Eclosão ${formatHatchEta(hatchAt)}. Estude para evoluir mais rápido.`,
    };
  },
};
