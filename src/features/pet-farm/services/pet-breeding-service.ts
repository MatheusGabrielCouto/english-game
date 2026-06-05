import { PetCollectionService } from '@/features/pet/services/pet-collection-service';
import { PlayerService } from '@/features/player/services/player-service';
import { GameEvents } from '@/services/game-events';
import { PetAcademyRepository } from '@/storage/repositories/pet-academy-repository';
import { PetAdventureRepository } from '@/storage/repositories/pet-adventure-repository';
import { PetFarmRepository } from '@/storage/repositories/pet-farm-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetStage } from '@/types/pet';
import { PetGender } from '@/types/pet-instance';

import { rollBreedingSpecies } from '../catalogs/pet-breeding-outcomes';
import { BREEDING_COOLDOWN_HOURS, BREEDING_COST_COINS } from '../catalogs/pet-farm-catalog';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { parseStatsJson } from '../catalogs/pet-stat-rules';
import { inheritStatsFromParents } from '../utils/pet-stat-inheritance';
import { PetRosterService } from './pet-roster-service';
import { PetStatsService } from './pet-stats-service';

const isAdultStage = (stage: import('@/types/pet').PetStageValue): boolean =>
  stage === PetStage.ADULT || stage === PetStage.LEGENDARY;

export const PetBreedingService = {
  async canBreed(
    motherId: number,
    fatherId: number,
  ): Promise<{ ok: boolean; message: string }> {
    if (motherId === fatherId) {
      return { ok: false, message: 'Escolha dois pets diferentes.' };
    }

    const mother = await PetInstanceRepository.findById(motherId);
    const father = await PetInstanceRepository.findById(fatherId);
    if (!mother || !father) return { ok: false, message: 'Pet não encontrado.' };

    if (mother.gender !== PetGender.FEMALE) {
      return { ok: false, message: 'O primeiro pet deve ser ♀ (mãe).' };
    }
    if (father.gender !== PetGender.MALE) {
      return { ok: false, message: 'O segundo pet deve ser ♂ (pai).' };
    }
    if (!isAdultStage(mother.stage) || !isAdultStage(father.stage)) {
      return { ok: false, message: 'Ambos precisam ser adultos.' };
    }

    const now = Date.now();
    if (mother.breedingCooldownUntil && new Date(mother.breedingCooldownUntil).getTime() > now) {
      return { ok: false, message: 'A mãe está em cooldown de cruzamento.' };
    }
    if (father.breedingCooldownUntil && new Date(father.breedingCooldownUntil).getTime() > now) {
      return { ok: false, message: 'O pai está em cooldown de cruzamento.' };
    }

    for (const pet of [mother, father]) {
      if (pet.passiveFieldSlot !== null) {
        return { ok: false, message: `${pet.nickname} está no pasto.` };
      }
      if (await PetAcademyRepository.findActiveForInstance(pet.id)) {
        return { ok: false, message: `${pet.nickname} está na academia.` };
      }
      if (await PetAdventureRepository.findActiveForInstance(pet.id)) {
        return { ok: false, message: `${pet.nickname} está em aventura.` };
      }
    }

    const fields = await PetFarmRepository.getFieldLevels();
    const incubators = await PetFarmRepository.listIncubators();
    if (incubators.length >= fields.incubator_room) {
      return { ok: false, message: 'Incubadora cheia. Melhore o campo ou espere eclosão.' };
    }

    return { ok: true, message: 'OK' };
  },

  async startBreeding(
    motherId: number,
    fatherId: number,
  ): Promise<{ ok: boolean; message: string }> {
    const check = await PetBreedingService.canBreed(motherId, fatherId);
    if (!check.ok) return check;

    const mother = (await PetInstanceRepository.findById(motherId))!;
    const father = (await PetInstanceRepository.findById(fatherId))!;

    const motherSpecies = getSpeciesDefinition(mother.speciesKey);
    const fatherSpecies = getSpeciesDefinition(father.speciesKey);
    const rarities = [motherSpecies.rarity, fatherSpecies.rarity];
    const maxRarity = rarities.includes('legendary')
      ? 'legendary'
      : rarities.includes('epic')
        ? 'epic'
        : rarities.includes('rare')
          ? 'rare'
          : 'common';
    const cost = BREEDING_COST_COINS[maxRarity] ?? 150;
    if (!PlayerService.removeCoins(cost)) {
      return { ok: false, message: `Precisa de ${cost.toLocaleString('pt-BR')} moedas.` };
    }

    const { speciesKey, outcomes } = rollBreedingSpecies(mother.speciesKey, father.speciesKey);
    const childStats = inheritStatsFromParents(
      mother.stats,
      father.stats,
      speciesKey,
      mother.speciesKey === father.speciesKey,
    );

    const childSpecies = getSpeciesDefinition(speciesKey);
    const hatchMs = childSpecies.hatchHours * 60 * 60 * 1000;
    const hatchAt = new Date(Date.now() + hatchMs).toISOString();

    await PetFarmRepository.addIncubator({
      speciesKey,
      source: 'breeding',
      hatchAt,
      parentMotherId: mother.id,
      parentFatherId: father.id,
      predictedStats: childStats,
    });

    const cooldownUntil = new Date(
      Date.now() + BREEDING_COOLDOWN_HOURS * 60 * 60 * 1000,
    ).toISOString();
    mother.breedingCooldownUntil = cooldownUntil;
    father.breedingCooldownUntil = cooldownUntil;
    await PetInstanceRepository.update(mother);
    await PetInstanceRepository.update(father);

    GameEvents.emit({
      type: 'PET_BRED',
      motherInstanceId: mother.id,
      fatherInstanceId: father.id,
      speciesKey,
    });

    await PetFarmRepository.logBreeding({
      motherInstanceId: mother.id,
      fatherInstanceId: father.id,
      outcomeSpeciesKey: speciesKey,
      rolledStats: childStats,
      parentStatsSnapshot: { mother: mother.stats, father: father.stats },
      outcomeWeightsSnapshot: outcomes,
    });

    return {
      ok: true,
      message: `Ovo de ${childSpecies.name} na incubadora! Eclosão em ~${childSpecies.hatchHours}h.`,
    };
  },

  async processReadyIncubators(): Promise<string[]> {
    const incubators = await PetFarmRepository.listIncubators();
    const messages: string[] = [];
    const now = Date.now();

    for (const egg of incubators) {
      if (new Date(egg.hatchAt).getTime() > now) continue;

      const stats = egg.predictedStatsJson
        ? parseStatsJson(egg.predictedStatsJson)
        : PetStatsService.rollInitialStats(egg.speciesKey);
      const species = getSpeciesDefinition(egg.speciesKey);
      await PetRosterService.createFromHatch({
        speciesKey: egg.speciesKey,
        stats,
        parentMotherId: egg.parentMotherId,
        parentFatherId: egg.parentFatherId,
      });
      await PetCollectionService.ensureSpeciesDiscovered(egg.speciesKey);
      await PetFarmRepository.removeIncubator(egg.id);
      messages.push(`${species.name} nasceu na fazenda!`);
    }

    if (messages.length > 0) {
      const { PetFarmBonusCache } = await import('./pet-farm-bonus-cache');
      await PetFarmBonusCache.refresh();
      const { PetGenerationService } = await import('./pet-generation-service');
      const { PetTraitBonusCache } = await import('./pet-trait-bonus-cache');
      await PetGenerationService.syncAchievementsAfterGenerationChange();
      await PetTraitBonusCache.refresh();
    }

    return messages;
  },
};
