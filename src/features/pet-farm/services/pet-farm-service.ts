import { GameEvents } from '@/services/game-events';

import { PetFarmRepository } from '@/storage/repositories/pet-farm-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetStage } from '@/types/pet';
import { PetFarmBonusCache } from './pet-farm-bonus-cache';


export const PetFarmService = {
  async assignToPassiveSlot(instanceId: number, slotIndex: number): Promise<{ ok: boolean; message: string }> {
    const fields = await PetFarmRepository.getFieldLevels();
    const maxSlots = fields.passive_pasture;
    if (slotIndex < 0 || slotIndex >= maxSlots) {
      return { ok: false, message: 'Slot bloqueado. Melhore o pasto de passivas.' };
    }

    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };
    if (instance.stage === PetStage.EGG) {
      return { ok: false, message: 'Ovo não pode ir ao pasto.' };
    }

    const { PetAcademyRepository } = await import('@/storage/repositories/pet-academy-repository');
    if (await PetAcademyRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Pet na academia — não pode ir ao pasto.' };
    }

    const { PetAdventureRepository } = await import('@/storage/repositories/pet-adventure-repository');
    if (await PetAdventureRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Pet em aventura — não pode ir ao pasto.' };
    }

    const all = await PetInstanceRepository.listAll();
    for (const other of all) {
      if (other.id === instanceId) continue;
      if (other.passiveFieldSlot === slotIndex) {
        other.passiveFieldSlot = null;
        await PetInstanceRepository.update(other);
      }
    }

    instance.passiveFieldSlot = slotIndex;
    await PetInstanceRepository.update(instance);
    GameEvents.emit({ type: 'PET_FARM_SLOT_CHANGED', instanceId, slotIndex });
    await PetFarmBonusCache.refresh();
    return { ok: true, message: `${instance.nickname} no pasto.` };
  },

  async removeFromPassiveSlot(instanceId: number): Promise<void> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return;
    instance.passiveFieldSlot = null;
    await PetInstanceRepository.update(instance);
    await PetFarmBonusCache.refresh();
  },

  async getFarmSnapshot() {
    const [instances, fields, incubators, adventures, academySessions, bonuses] = await Promise.all([
      PetInstanceRepository.listAll(),
      PetFarmRepository.getFieldLevels(),
      PetFarmRepository.listIncubators(),
      import('./pet-adventure-service').then((m) => m.PetAdventureService.listActive()),
      import('./pet-academy-service').then((m) => m.PetAcademyService.listActive()),
      import('./pet-farm-bonus-service').then((m) => m.PetFarmBonusService.getAggregatedBonuses()),
    ]);

    const pastureSlots = fields.passive_pasture;
    const slots = Array.from({ length: pastureSlots }, (_, index) => {
      const pet = instances.find((i) => i.passiveFieldSlot === index) ?? null;
      return { index, pet };
    });

    return {
      instances,
      fields,
      incubators,
      adventures,
      academySessions,
      bonuses,
      slots,
      barnCapacity: fields.barn_storage,
    };
  },

  formatBonusSummary(bonuses: Awaited<ReturnType<typeof import('./pet-farm-bonus-service').PetFarmBonusService.getAggregatedBonuses>>): string {
    const parts: string[] = [];
    if (bonuses.xp_boost > 0) parts.push(`+${Math.round(bonuses.xp_boost)}% XP`);
    if (bonuses.coin_boost > 0) parts.push(`+${Math.round(bonuses.coin_boost)}% Coins`);
    if (bonuses.loot_luck > 0) parts.push(`+${Math.round(bonuses.loot_luck)}% Loot`);
    if (bonuses.shield_weekly > 0) {
      parts.push(`+${Math.round(bonuses.shield_weekly)} escudo/sem`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'Nenhum bônus ativo';
  },
};
