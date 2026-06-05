import { PlayerService } from '@/features/player/services/player-service';
import { InventorySpecialItemRepository } from '@/storage/repositories/inventory-special-item-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import type { PetInstance } from '@/types/pet-instance';

import { getTraitDefinition } from '../catalogs/pet-traits-catalog';
import { computeTraitRerollCoinCost } from '../constants/pet-trait-balance';
import { PetTraitBonusCache } from './pet-trait-bonus-cache';
import { PetTraitRollService } from './pet-trait-roll-service';

export const TRAIT_REROLL_SINGLE_ITEM = 'trait_reroll_single';
export const TRAIT_REROLL_ALL_ITEM = 'trait_reroll_all';

export const PetTraitService = {
  async backfillMissingTraits(): Promise<number> {
    const all = await PetInstanceRepository.listAll();
    let updated = 0;
    for (const instance of all) {
      if (instance.traitKeys.length > 0) continue;
      instance.traitKeys = PetTraitRollService.rollInitialTraits(instance.speciesKey);
      await PetInstanceRepository.update(instance);
      updated += 1;
    }
    if (updated > 0) await PetTraitBonusCache.refresh();
    return updated;
  },

  async rerollSlotWithCoins(instanceId: number, slotIndex: number): Promise<{ ok: boolean; message: string }> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };

    const cost = computeTraitRerollCoinCost(instance.generation);
    if (!PlayerService.removeCoins(cost)) {
      return { ok: false, message: `Precisa de ${cost.toLocaleString('pt-BR')} moedas.` };
    }

    instance.traitKeys = PetTraitRollService.rerollSlot(
      instance.speciesKey,
      instance.traitKeys,
      slotIndex,
    );
    await PetInstanceRepository.update(instance);
    if (instance.isActive) await PetTraitBonusCache.refresh();
    return { ok: true, message: 'Trait rerrolado.' };
  },

  async rerollAllWithCoins(instanceId: number): Promise<{ ok: boolean; message: string }> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };

    const cost = computeTraitRerollCoinCost(instance.generation) * 2;
    if (!PlayerService.removeCoins(cost)) {
      return { ok: false, message: `Precisa de ${cost.toLocaleString('pt-BR')} moedas.` };
    }

    instance.traitKeys = PetTraitRollService.rerollAll(instance.speciesKey);
    await PetInstanceRepository.update(instance);
    if (instance.isActive) await PetTraitBonusCache.refresh();
    return { ok: true, message: 'Todos os traits rerrolados.' };
  },

  async rerollSlotWithItem(instanceId: number, slotIndex: number): Promise<{ ok: boolean; message: string }> {
    const consumed = await InventorySpecialItemRepository.consumeOne(TRAIT_REROLL_SINGLE_ITEM);
    if (!consumed) {
      return { ok: false, message: 'Você não tem Trait Reroll (slot).' };
    }
    return PetTraitService.rerollSlotFree(instanceId, slotIndex);
  },

  async rerollSlotFree(instanceId: number, slotIndex: number): Promise<{ ok: boolean; message: string }> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };
    instance.traitKeys = PetTraitRollService.rerollSlot(
      instance.speciesKey,
      instance.traitKeys,
      slotIndex,
    );
    await PetInstanceRepository.update(instance);
    if (instance.isActive) await PetTraitBonusCache.refresh();
    return { ok: true, message: 'Trait rerrolado.' };
  },

  formatTraitChip(traitKey: string): { name: string; description: string; isNegative: boolean } {
    const def = getTraitDefinition(traitKey);
    if (!def) {
      return { name: traitKey, description: '', isNegative: false };
    }
    return { name: def.name, description: def.description, isNegative: def.isNegative };
  },

  describeInstanceTraits(instance: PetInstance): string {
    if (instance.traitKeys.length === 0) return 'Sem traits';
    return instance.traitKeys
      .map((k) => PetTraitService.formatTraitChip(k).name)
      .join(' · ');
  },
};
