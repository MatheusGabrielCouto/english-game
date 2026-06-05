import { grantLootBoxReward } from '@/features/loot-boxes/services/loot-box-grant';
import { applyPetExperience, resolveStageFromLevel } from '@/features/pet/utils/xp';
import { PlayerService } from '@/features/player/services/player-service';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { GameEvents } from '@/services/game-events';
import { PetAcademyRepository } from '@/storage/repositories/pet-academy-repository';
import { PetAdventureRepository } from '@/storage/repositories/pet-adventure-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { LootBoxRarity } from '@/types/inventory';
import { PetStage } from '@/types/pet';
import type {
    PetAdventureBiomeKey,
    PetAdventureClaimResult,
    PetAdventureDurationKey,
    PetAdventureEntry,
} from '@/types/pet-adventure';
import type { PetInstance } from '@/types/pet-instance';

import {
    computeAdventureSuccessChance,
    isBiomeUnlocked,
    PET_ADVENTURE_BIOME_BY_KEY,
    PET_ADVENTURE_DURATION_BY_KEY,
    PET_ADVENTURE_LONG_SLOT_BASE,
    PET_ADVENTURE_PARTIAL_REWARD_RATIO,
    PET_ADVENTURE_SHORT_SLOT_BASE,
    PET_ADVENTURE_WEEKLY_24H_CAP,
    rollCoinsInRange,
    rollStudyPointsForShore,
} from '../catalogs/pet-adventures-catalog';
import { PetAdventureNotificationService } from './pet-adventure-notification-service';
import { PetInstanceMemoryService } from './pet-instance-memory-service';
import { PetRosterService } from './pet-roster-service';

const weekAgoIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
};

const slotLimitsFor = (traitKeys: string[]) => {
  const pathfinder = traitKeys.includes('pathfinder');
  const scout = traitKeys.includes('scout');
  return {
    shortMax: PET_ADVENTURE_SHORT_SLOT_BASE + (pathfinder ? 1 : 0),
    longMax: PET_ADVENTURE_LONG_SLOT_BASE + (scout ? 1 : 0),
  };
};

const countSlotsUsed = (
  adventures: PetAdventureEntry[],
  group: 'short' | 'long',
): number =>
  adventures.filter((a) => PET_ADVENTURE_DURATION_BY_KEY[a.durationKey]?.slotGroup === group)
    .length;

const accountAdventureTraitKeys = async (): Promise<string[]> => {
  const all = await PetInstanceRepository.listAll();
  const keys = new Set<string>();
  for (const pet of all) {
    if (pet.traitKeys.includes('pathfinder')) keys.add('pathfinder');
    if (pet.traitKeys.includes('scout')) keys.add('scout');
  }
  return [...keys];
};

export const PetAdventureService = {
  async listActive(): Promise<PetAdventureEntry[]> {
    return PetAdventureRepository.listActive();
  },

  countReady(adventures: PetAdventureEntry[]): number {
    const now = Date.now();
    return adventures.filter((a) => new Date(a.endsAt).getTime() <= now).length;
  },

  isReady(entry: PetAdventureEntry): boolean {
    return new Date(entry.endsAt).getTime() <= Date.now();
  },

  getSuccessPreview(instance: PetInstance, biomeKey: PetAdventureBiomeKey): number {
    return computeAdventureSuccessChance(instance, biomeKey);
  },

  async getSlotStatus(): Promise<{
    shortUsed: number;
    shortMax: number;
    longUsed: number;
    longMax: number;
    weekly24hUsed: number;
    weekly24hCap: number;
  }> {
    const adventures = await PetAdventureRepository.listActive();
    const limits = slotLimitsFor(await accountAdventureTraitKeys());
    const weekly24hUsed =
      (await PetAdventureRepository.count24hClaimedSince(weekAgoIso())) +
      adventures.filter((a) => a.durationKey === '24h').length;

    return {
      shortUsed: countSlotsUsed(adventures, 'short'),
      shortMax: limits.shortMax,
      longUsed: countSlotsUsed(adventures, 'long'),
      longMax: limits.longMax,
      weekly24hUsed,
      weekly24hCap: PET_ADVENTURE_WEEKLY_24H_CAP,
    };
  },

  async canStart(
    instanceId: number,
    biomeKey: PetAdventureBiomeKey,
    durationKey: PetAdventureDurationKey,
    options?: { leagueGoldUnlocked?: boolean },
  ): Promise<{ ok: boolean; message: string }> {
    await PetRosterService.ensureInitialized();

    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };
    if (instance.stage === PetStage.EGG) {
      return { ok: false, message: 'Ovos não podem ir em aventura.' };
    }

    const biome = isBiomeUnlocked(
      instance,
      PET_ADVENTURE_BIOME_BY_KEY[biomeKey],
      options?.leagueGoldUnlocked ?? false,
    );
    if (!biome.ok) return { ok: false, message: biome.reason ?? 'Bioma bloqueado.' };

    const duration = PET_ADVENTURE_DURATION_BY_KEY[durationKey];
    if (!duration) return { ok: false, message: 'Duração inválida.' };

    const existing = await PetAdventureRepository.findActiveForInstance(instanceId);
    if (existing) return { ok: false, message: 'Este pet já está em aventura.' };

    if (await PetAcademyRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Pet na academia — espere a aula terminar.' };
    }

    if (instance.passiveFieldSlot !== null) {
      return { ok: false, message: 'Remova o pet do pasto antes da aventura.' };
    }

    if (instance.breedingPenSlot !== null) {
      return { ok: false, message: 'Pet no laboratório — libere antes da aventura.' };
    }

    const adventures = await PetAdventureRepository.listActive();
    const limits = slotLimitsFor(await accountAdventureTraitKeys());
    const group = duration.slotGroup;
    const used = countSlotsUsed(adventures, group);
    const max = group === 'short' ? limits.shortMax : limits.longMax;
    if (used >= max) {
      return {
        ok: false,
        message:
          group === 'short'
            ? 'Slots curtos cheios (15m–4h). Espere ou use missões mais longas.'
            : 'Slots longos cheios (8h–24h).',
      };
    }

    if (duration.countsForWeekly24hCap) {
      const claimed = await PetAdventureRepository.count24hClaimedSince(weekAgoIso());
      const pending24h = adventures.filter((a) => a.durationKey === '24h').length;
      if (claimed + pending24h >= PET_ADVENTURE_WEEKLY_24H_CAP) {
        return { ok: false, message: 'Limite de 3 aventuras 24h por semana.' };
      }
    }

    return { ok: true, message: 'OK' };
  },

  async startAdventure(
    instanceId: number,
    biomeKey: PetAdventureBiomeKey,
    durationKey: PetAdventureDurationKey,
    options?: { leagueGoldUnlocked?: boolean },
  ): Promise<{ ok: boolean; message: string; adventureId?: number }> {
    const check = await PetAdventureService.canStart(
      instanceId,
      biomeKey,
      durationKey,
      options,
    );
    if (!check.ok) return check;

    const duration = PET_ADVENTURE_DURATION_BY_KEY[durationKey];
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + duration.minutes * 60_000);

    const adventureId = await PetAdventureRepository.insert({
      instanceId,
      biomeKey,
      durationKey,
      startedAt: startedAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });

    const entry = (await PetAdventureRepository.findById(adventureId))!;
    await PetAdventureNotificationService.scheduleReturn(entry);

    GameEvents.emit({
      type: 'PET_ADVENTURE_STARTED',
      adventureId,
      instanceId,
      biomeKey,
      durationKey,
    });

    return {
      ok: true,
      message: 'Aventura iniciada!',
      adventureId,
    };
  },

  async claimAdventure(adventureId: number): Promise<PetAdventureClaimResult | null> {
    const adventure = await PetAdventureRepository.findById(adventureId);
    if (!adventure) return null;
    if (!PetAdventureService.isReady(adventure)) return null;

    const instance = await PetInstanceRepository.findById(adventure.instanceId);
    if (!instance) {
      await PetAdventureRepository.remove(adventureId);
      return null;
    }

    const duration = PET_ADVENTURE_DURATION_BY_KEY[adventure.durationKey];
    const biomeKey = adventure.biomeKey;
    const successChance = computeAdventureSuccessChance(instance, biomeKey);
    const success = Math.random() < successChance;
    const partial = !success;

    let coins = rollCoinsInRange(duration.coinsMin, duration.coinsMax);
    let petXp = duration.petXp;
    let studyPoints = 0;
    let lootGranted = false;

    if (partial) {
      coins = Math.max(1, Math.round(coins * PET_ADVENTURE_PARTIAL_REWARD_RATIO));
      petXp = Math.max(1, Math.round(petXp * PET_ADVENTURE_PARTIAL_REWARD_RATIO));
    }

    if (success || partial) {
      if (biomeKey === 'meadow' || biomeKey === 'ruins' || biomeKey === 'summit') {
        PlayerService.addCoins(coins);
      } else if (biomeKey === 'cave' && success) {
        await grantLootBoxReward(LootBoxRarity.COMMON, 'pet');
        lootGranted = true;
        PlayerService.addCoins(Math.round(coins * 0.35));
      } else if (biomeKey === 'shore') {
        studyPoints = rollStudyPointsForShore(duration);
        if (partial) studyPoints = Math.max(1, Math.round(studyPoints * PET_ADVENTURE_PARTIAL_REWARD_RATIO));
        await StudyPointsService.earn(studyPoints, 'Aventura — Costa', 'pet_adventure');
        PlayerService.addCoins(Math.round(coins * 0.25));
      } else {
        PlayerService.addCoins(coins);
      }

      if (duration.lootOnSuccess && success && biomeKey !== 'cave') {
        await grantLootBoxReward(LootBoxRarity.COMMON, 'pet');
        lootGranted = true;
      }
    }

    const previousLevel = instance.level;
    const previousStage = instance.stage;
    const xpResult = applyPetExperience(instance.level, instance.experience, petXp);
    instance.level = xpResult.level;
    instance.experience = xpResult.experience;
    instance.stage = resolveStageFromLevel(instance.level);
    instance.totalAdventures += 1;
    instance.updatedAt = new Date().toISOString();
    await PetInstanceRepository.update(instance);

    if (instance.isActive) {
      const pet = await getOrCreatePet();
      await savePet({
        ...pet,
        level: instance.level,
        experience: instance.experience,
        stage: instance.stage,
        updatedAt: instance.updatedAt,
      });
    }

    await PetInstanceMemoryService.onActiveInstanceProgress({
      instanceId: instance.id,
      previousLevel,
      previousStage,
      nextLevel: instance.level,
      nextStage: instance.stage,
      nickname: instance.nickname,
      speciesKey: instance.speciesKey,
    });

    await PetAdventureNotificationService.cancelReturn(adventureId);
    await PetAdventureRepository.remove(adventureId);
    if (adventure.durationKey === '24h') {
      await PetAdventureRepository.log24hClaim(new Date().toISOString());
    }

    const flavor = partial
      ? 'Expedição difícil — recompensa parcial.'
      : 'Expedição bem-sucedida!';

    if (adventure.durationKey === '24h' && success) {
      await PetInstanceMemoryService.tryUnlock(instance.id, 'adventure_epic');
    }

    GameEvents.emit({
      type: 'PET_ADVENTURE_CLAIMED',
      adventureId,
      instanceId: instance.id,
      success,
      durationKey: adventure.durationKey,
    });

    return {
      adventureId,
      instanceId: instance.id,
      success,
      partial,
      coins,
      petXp,
      studyPoints,
      lootGranted,
      flavor,
    };
  },

  async processReadyAdventures(): Promise<string[]> {
    const adventures = await PetAdventureRepository.listActive();
    const ready = adventures.filter((a) => PetAdventureService.isReady(a));
    const messages: string[] = [];

    for (const adventure of ready) {
      const result = await PetAdventureService.claimAdventure(adventure.id);
      if (!result) continue;
      const instance = await PetInstanceRepository.findById(result.instanceId);
      const name = instance?.nickname ?? 'Pet';
      messages.push(
        `${name}: ${result.flavor} +${result.coins} moedas, +${result.petXp} XP${
          result.studyPoints > 0 ? `, +${result.studyPoints} SP` : ''
        }${result.lootGranted ? ', loot!' : ''}`,
      );
    }

    return messages;
  },
};
