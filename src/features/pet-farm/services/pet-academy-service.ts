import { applyPetExperience, resolveStageFromLevel } from '@/features/pet/utils/xp';
import { GameEvents } from '@/services/game-events';
import { PetAcademyRepository } from '@/storage/repositories/pet-academy-repository';
import { PetAdventureRepository } from '@/storage/repositories/pet-adventure-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { PetStage } from '@/types/pet';
import type { PetAcademyClaimResult, PetAcademyEntry, PetAcademyTrackKey } from '@/types/pet-academy';
import type { PetInstance, PetStatKeyValue } from '@/types/pet-instance';

import {
    PET_ACADEMY_ACE_XP_BONUS,
    PET_ACADEMY_BONUS_TRAIT_KEYS,
    PET_ACADEMY_MAX_CONCURRENT,
    PET_ACADEMY_MENTOR_STAT_BONUS,
    PET_ACADEMY_STAT_GAIN_MAX,
    PET_ACADEMY_STAT_GAIN_MIN,
    PET_ACADEMY_TRACK_BY_KEY,
    PET_ACADEMY_TRAIT_ROLL_CHANCE,
} from '../catalogs/pet-academy-catalog';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import {
    clampStat,
    PET_STAT_LABELS,
    RARITY_STAT_RANGE,
} from '../catalogs/pet-stat-rules';
import { PetAcademyNotificationService } from './pet-academy-notification-service';
import { PetInstanceMemoryService } from './pet-instance-memory-service';
import { PetRosterService } from './pet-roster-service';
import { PetTraitRollService } from './pet-trait-roll-service';

const rollStatGain = (instance: PetInstance): number => {
  const base =
    PET_ACADEMY_STAT_GAIN_MIN +
    Math.floor(Math.random() * (PET_ACADEMY_STAT_GAIN_MAX - PET_ACADEMY_STAT_GAIN_MIN + 1));
  const mentor = instance.traitKeys.includes('mentor_spirit');
  const boosted = mentor ? base * (1 + PET_ACADEMY_MENTOR_STAT_BONUS) : base;
  return Math.max(1, Math.round(boosted));
};

const xpWithAce = (baseXp: number, traitKeys: string[]): number => {
  if (!traitKeys.includes('academy_ace')) return baseXp;
  return Math.max(1, Math.round(baseXp * (1 + PET_ACADEMY_ACE_XP_BONUS)));
};

const tryGrantAcademyTrait = (instance: PetInstance): string | null => {
  if (Math.random() >= PET_ACADEMY_TRAIT_ROLL_CHANCE) return null;

  const maxSlots = PetTraitRollService.slotCountForSpecies(instance.speciesKey);
  if (instance.traitKeys.length >= maxSlots) return null;

  const pool = PET_ACADEMY_BONUS_TRAIT_KEYS.filter((key) => {
    if (instance.traitKeys.includes(key)) return false;
    return true;
  });

  if (pool.length === 0) return null;
  const picked = pool[Math.floor(Math.random() * pool.length)] ?? null;
  if (!picked) return null;

  instance.traitKeys = [...instance.traitKeys, picked];
  return picked;
};

const applyStatToInstance = (instance: PetInstance, statKey: PetStatKeyValue, gain: number): void => {
  const species = getSpeciesDefinition(instance.speciesKey);
  const cap = RARITY_STAT_RANGE[species.rarity].cap;
  instance.stats[statKey] = clampStat(instance.stats[statKey] + gain, cap);
};

export const PetAcademyService = {
  async listActive(): Promise<PetAcademyEntry[]> {
    return PetAcademyRepository.listActive();
  },

  isReady(entry: PetAcademyEntry): boolean {
    return new Date(entry.endsAt).getTime() <= Date.now();
  },

  countReady(sessions: PetAcademyEntry[]): number {
    const now = Date.now();
    return sessions.filter((s) => new Date(s.endsAt).getTime() <= now).length;
  },

  async getCapacity(): Promise<{ used: number; max: number }> {
    const sessions = await PetAcademyRepository.listActive();
    return { used: sessions.length, max: PET_ACADEMY_MAX_CONCURRENT };
  },

  async canStart(instanceId: number, trackKey: PetAcademyTrackKey): Promise<{ ok: boolean; message: string }> {
    await PetRosterService.ensureInitialized();

    const track = PET_ACADEMY_TRACK_BY_KEY[trackKey];
    if (!track) return { ok: false, message: 'Trilha inválida.' };

    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };
    if (instance.stage === PetStage.EGG) {
      return { ok: false, message: 'Ovos não podem estudar na academia.' };
    }

    if (await PetAcademyRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Este pet já está na academia.' };
    }

    if (await PetAdventureRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Pet em aventura — espere o retorno.' };
    }

    if (instance.passiveFieldSlot !== null) {
      return { ok: false, message: 'Remova o pet do pasto antes de estudar.' };
    }

    if (instance.breedingPenSlot !== null) {
      return { ok: false, message: 'Pet no laboratório — libere antes de estudar.' };
    }

    const sessions = await PetAcademyRepository.listActive();
    if (sessions.length >= PET_ACADEMY_MAX_CONCURRENT) {
      return { ok: false, message: `Academia cheia (${PET_ACADEMY_MAX_CONCURRENT} sessões).` };
    }

    return { ok: true, message: 'OK' };
  },

  async startSession(
    instanceId: number,
    trackKey: PetAcademyTrackKey,
  ): Promise<{ ok: boolean; message: string; sessionId?: number }> {
    const check = await PetAcademyService.canStart(instanceId, trackKey);
    if (!check.ok) return check;

    const track = PET_ACADEMY_TRACK_BY_KEY[trackKey];
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + track.minutes * 60_000);

    const sessionId = await PetAcademyRepository.insert({
      instanceId,
      trackKey,
      startedAt: startedAt.toISOString(),
      endsAt: endsAt.toISOString(),
    });

    const entry = (await PetAcademyRepository.findById(sessionId))!;
    await PetAcademyNotificationService.scheduleComplete(entry);

    GameEvents.emit({
      type: 'PET_ACADEMY_STARTED',
      sessionId,
      instanceId,
      trackKey,
    });

    return { ok: true, message: `${track.label} iniciada!`, sessionId };
  },

  async claimSession(sessionId: number): Promise<PetAcademyClaimResult | null> {
    const session = await PetAcademyRepository.findById(sessionId);
    if (!session) return null;
    if (!PetAcademyService.isReady(session)) return null;

    const instance = await PetInstanceRepository.findById(session.instanceId);
    if (!instance) {
      await PetAcademyRepository.remove(sessionId);
      return null;
    }

    const track = PET_ACADEMY_TRACK_BY_KEY[session.trackKey];
    const statGain = rollStatGain(instance);
    const petXp = xpWithAce(track.petXp, instance.traitKeys);

    const previousLevel = instance.level;
    const previousStage = instance.stage;

    applyStatToInstance(instance, track.statKey, statGain);

    const xpResult = applyPetExperience(instance.level, instance.experience, petXp);
    instance.level = xpResult.level;
    instance.experience = xpResult.experience;
    instance.stage = resolveStageFromLevel(instance.level);

    const traitGranted = tryGrantAcademyTrait(instance);
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

    await PetAcademyRepository.remove(sessionId);

    const statLabel = PET_STAT_LABELS[track.statKey];
    const flavor = traitGranted
      ? `Graduação! +${statGain} ${statLabel}, trait ${traitGranted}.`
      : `Aula concluída! +${statGain} ${statLabel}.`;

    GameEvents.emit({
      type: 'PET_ACADEMY_CLAIMED',
      sessionId,
      instanceId: instance.id,
      trackKey: session.trackKey,
    });

    return {
      sessionId,
      instanceId: instance.id,
      trackKey: session.trackKey,
      petXp,
      statKey: track.statKey,
      statGain,
      traitGranted,
      flavor,
    };
  },

  async processReadySessions(): Promise<string[]> {
    const sessions = await PetAcademyRepository.listActive();
    const ready = sessions.filter((s) => PetAcademyService.isReady(s));
    const messages: string[] = [];

    for (const session of ready) {
      const result = await PetAcademyService.claimSession(session.id);
      if (!result) continue;
      const instance = await PetInstanceRepository.findById(result.instanceId);
      const name = instance?.nickname ?? 'Pet';
      messages.push(
        `${name}: ${result.flavor} +${result.petXp} XP`,
      );
    }

    return messages;
  },
};
