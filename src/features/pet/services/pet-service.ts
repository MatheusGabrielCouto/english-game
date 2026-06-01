import { usePlayerStore } from '@/features/player/store/player-store';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { PetAnalyticsRepository } from '@/storage/repositories/pet-analytics-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { PetStageRewardsRepository } from '@/storage/repositories/pet-stage-rewards-repository';
import { PetMood, PetStage, type Pet, type PetStageValue } from '@/types/pet';
import { PetAnimationCategory } from '@/types/pet-expansion';

import { PunishmentModifierService } from '@/features/punishments/services/punishment-modifier-service';
import { pickRandomAnimation } from '../catalogs/pet-animations-catalog';
import { PET_XP_REWARDS, STAGE_EVOLUTION_REWARDS } from '../constants';
import { PET_VITAL_STUDY_BONUS } from '../constants/vitals';
import { usePetScreenStore } from '../store/pet-screen-store';
import { clampVital } from '../utils/affinity';
import { isNegativeMood, isPositiveMood, resolveMoodFromStreak } from '../utils/mood';
import {
    applyVitalDecay,
    getRoutinePhase,
    moodToAnimationCategory,
} from '../utils/routine';
import { applyPetExperience, normalizePetExperience, resolveStageFromLevel } from '../utils/xp';
import { PetCollectionService } from './pet-collection-service';
import { PetRuntimeCache } from './pet-runtime-cache';
import { PetVitalsService } from './pet-vitals-service';

type PetListener = (pet: Pet) => void;

let listenersInitialized = false;
const petListeners = new Set<PetListener>();
let cachedPet: Pet | null = null;
let experienceChain: Promise<Pet | null> = Promise.resolve(null);

const notifyListeners = () => {
  PetRuntimeCache.set(cachedPet);
  if (!cachedPet) return;
  petListeners.forEach((listener) => listener(cachedPet as Pet));
};

export const PetService = {
  subscribe(listener: PetListener): () => void {
    petListeners.add(listener);
    if (cachedPet) listener(cachedPet);
    return () => petListeners.delete(listener);
  },

  getCachedPet(): Pet | null {
    return cachedPet;
  },

  setCachedPet(pet: Pet): void {
    cachedPet = pet;
    PetRuntimeCache.set(pet);
    notifyListeners();
  },

  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void PetService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'DAILY_MISSION_COMPLETED':
        await PetService.addExperience(PET_XP_REWARDS.DAILY_MISSION);
        await PetService.applyStudyBonus(PET_VITAL_STUDY_BONUS.DAILY_MISSION);
        await PetService.triggerExcitedAnimation();
        break;
      case 'WEEKLY_MISSION_CLAIMED':
        await PetService.addExperience(PET_XP_REWARDS.WEEKLY_MISSION);
        await PetService.triggerExcitedAnimation();
        break;
      case 'CONTRACT_COMPLETED':
        await PetService.addExperience(PET_XP_REWARDS.CONTRACT);
        await PetService.triggerExcitedAnimation();
        break;
      case 'XP_GAINED':
        if (event.amount > 0) {
          await PetService.triggerExcitedAnimation();
        }
        break;
      case 'PET_EXPERIENCE_GRANT':
        await PetService.addExperience(event.amount);
        break;
      case 'STUDY_DAY_RECORDED':
        await PetService.applyStudyBonus(PET_VITAL_STUDY_BONUS.STUDY_DAY);
        await PetService.updateMood();
        break;
      case 'FOCUS_SESSION_COMPLETED':
        await PetService.applyStudyBonus(PET_VITAL_STUDY_BONUS.FOCUS_SESSION);
        break;
      case 'SHIELD_USED':
        await PetService.updateMood();
        break;
      default:
        break;
    }
  },

  async syncRoutineAndVitals(pet: Pet): Promise<Pet> {
    const routinePhase = getRoutinePhase();
    const vitals = applyVitalDecay(pet);
    const animationCategory =
      routinePhase === 'sleeping'
        ? PetAnimationCategory.IDLE
        : moodToAnimationCategory(pet.mood);
    const animation = pickRandomAnimation(animationCategory, pet.affinity);

    const updated: Pet = {
      ...pet,
      routinePhase,
      energy: clampVital(vitals.energy),
      hunger: clampVital(vitals.hunger),
      happiness: clampVital(vitals.happiness),
      motivation: clampVital(vitals.motivation),
      currentAnimationKey: animation.key,
      updatedAt: new Date().toISOString(),
    };

    await savePet(updated);
    cachedPet = updated;
    return updated;
  },

  async initialize(): Promise<Pet> {
    cachedPet = await getOrCreatePet();
    cachedPet = await PetService.reconcileProgress(cachedPet);
    await PetCollectionService.reconcilePrematureDiscovery(cachedPet);
    cachedPet = await PetService.syncRoutineAndVitals(cachedPet);
    await PetService.updateMood();
    usePetScreenStore.getState().setLoading(false);
    notifyListeners();
    return cachedPet;
  },

  async refresh(): Promise<Pet> {
    cachedPet = await getOrCreatePet();
    cachedPet = await PetService.reconcileProgress(cachedPet);
    cachedPet = await PetService.syncRoutineAndVitals(cachedPet);
    notifyListeners();
    return cachedPet;
  },

  async reconcileProgress(pet: Pet): Promise<Pet> {
    const normalized = normalizePetExperience(pet.level, pet.experience);
    if (normalized.level === pet.level && normalized.experience === pet.experience) {
      return pet;
    }

    const stage = await PetService.updateStage(normalized.level, pet.stage);
    const updatedPet: Pet = {
      ...pet,
      level: normalized.level,
      experience: normalized.experience,
      stage,
    };

    await savePet(updatedPet);
    cachedPet = updatedPet;
    return updatedPet;
  },

  async triggerExcitedAnimation(): Promise<void> {
    const pet = cachedPet ?? (await getOrCreatePet());
    const animation = pickRandomAnimation(PetAnimationCategory.EXCITED, pet.affinity);
    const updated = { ...pet, currentAnimationKey: animation.key };
    await savePet(updated);
    cachedPet = updated;
    notifyListeners();
  },

  async applyStudyBonus(
    bonus: Partial<Pick<Pet, 'hunger' | 'energy' | 'happiness' | 'motivation'>>,
  ): Promise<void> {
    const pet = cachedPet ?? (await getOrCreatePet());
    const vitals = PetVitalsService.applyBonuses(pet, bonus);
    const updated: Pet = {
      ...pet,
      ...vitals,
      updatedAt: new Date().toISOString(),
    };
    await savePet(updated);
    cachedPet = updated;
    notifyListeners();
  },

  async updateMood(streak = usePlayerStore.getState().currentStreak): Promise<Pet> {
    const pet = cachedPet ?? (await getOrCreatePet());
    const streakMood = resolveMoodFromStreak(streak);
    const punishmentMood = PunishmentModifierService.getPetMoodOverride();
    let mood =
      punishmentMood && isNegativeMood(punishmentMood) ? punishmentMood : streakMood;

    if (PetVitalsService.isCriticallyLow(pet) && !isNegativeMood(mood)) {
      mood = PetMood.SAD;
    } else if (PetVitalsService.isLow(pet) && (mood === PetMood.VERY_HAPPY || mood === PetMood.HAPPY)) {
      mood = PetMood.NORMAL;
    }

    if (pet.mood === mood) {
      cachedPet = pet;
      return pet;
    }

    const animation = pickRandomAnimation(moodToAnimationCategory(mood), pet.affinity);
    const updatedPet: Pet = {
      ...pet,
      mood,
      currentAnimationKey: animation.key,
    };
    await savePet(updatedPet);
    cachedPet = updatedPet;

    await PetService.recordMoodAnalytics(mood);
    notifyListeners();
    return updatedPet;
  },

  async recordMoodAnalytics(mood: Pet['mood']): Promise<void> {
    const today = getTodayKey();
    const analytics = await PetAnalyticsRepository.getOrCreate();

    if (analytics.lastMoodRecordDate === today) return;

    const nextAnalytics = {
      ...analytics,
      lastMoodRecordDate: today,
      positiveMoodDays: analytics.positiveMoodDays + (isPositiveMood(mood) ? 1 : 0),
      negativeMoodDays: analytics.negativeMoodDays + (isNegativeMood(mood) ? 1 : 0),
    };

    await PetAnalyticsRepository.save(nextAnalytics);
  },

  async updateStage(level: number, previousStage: PetStageValue): Promise<PetStageValue> {
    const nextStage = resolveStageFromLevel(level);

    if (nextStage === previousStage) return previousStage;

    if (previousStage === PetStage.EGG && nextStage !== PetStage.EGG) {
      const pet = cachedPet ?? (await getOrCreatePet());
      await PetCollectionService.ensureSpeciesDiscovered(pet.speciesKey);
    }

    const reward = STAGE_EVOLUTION_REWARDS[nextStage as Exclude<PetStageValue, typeof PetStage.EGG>];
    if (reward) {
      const claimed = await PetStageRewardsRepository.isClaimed(nextStage);
      if (!claimed) {
        await PetStageRewardsRepository.markClaimed(nextStage);
        usePlayerStore.getState().addCoins(reward.coins);
      }
    }

    const analytics = await PetAnalyticsRepository.getOrCreate();
    await PetAnalyticsRepository.save({
      ...analytics,
      totalEvolutions: analytics.totalEvolutions + 1,
      currentLevel: level,
      currentStage: nextStage,
    });

    GameEvents.emit({ type: 'PET_STAGE_EVOLVED', stage: nextStage });
    return nextStage;
  },

  async addExperience(amount: number): Promise<Pet | null> {
    if (amount <= 0) return cachedPet;

    const task = experienceChain.then(() => PetService.applyExperienceInternal(amount));
    experienceChain = task.then(() => null);
    return task;
  },

  async applyExperienceInternal(amount: number): Promise<Pet | null> {
    const pet = cachedPet ?? (await getOrCreatePet());
    const reconciled = normalizePetExperience(pet.level, pet.experience);
    const baseLevel = reconciled.level;
    const baseExperience = reconciled.experience;
    const previousStage = pet.stage;
    const result = applyPetExperience(baseLevel, baseExperience, amount);
    const stage = await PetService.updateStage(result.level, previousStage);

    const updatedPet: Pet = {
      ...pet,
      level: result.level,
      experience: result.experience,
      stage,
    };

    await savePet(updatedPet);
    cachedPet = updatedPet;

    const analytics = await PetAnalyticsRepository.getOrCreate();
    await PetAnalyticsRepository.save({
      ...analytics,
      currentLevel: updatedPet.level,
      currentStage: updatedPet.stage,
      totalExperienceGained: analytics.totalExperienceGained + amount,
    });

    await PetService.updateMood();
    notifyListeners();
    GameEvents.emit({ type: 'PET_XP_GAINED', amount });
    return updatedPet;
  },
};
