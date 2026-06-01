import {
  PetAnimationCategory,
  PetInteractionType,
  type PetEquippedCosmetics,
  type PetInteractionResult,
  type PetInteractionTypeValue,
} from '@/types/pet-expansion';
import { GameEvents } from '@/services/game-events';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import type { Pet } from '@/types/pet';

import {
  DEFAULT_PET_ANIMATION_KEY,
  PET_ANIMATIONS_BY_KEY,
  pickRandomAnimation,
} from '../catalogs/pet-animations-catalog';
import { DEFAULT_FOOD_KEY, PET_FOODS_BY_KEY } from '../catalogs/pet-foods-catalog';
import { pickDialogue } from '../catalogs/pet-dialogues-catalog';
import { DEFAULT_TOY_KEY, PET_TOYS_BY_KEY } from '../catalogs/pet-toys-catalog';
import { PET_COSMETICS_BY_KEY } from '../catalogs/pet-cosmetics-catalog';
import { clampAffinity, clampVital } from '../utils/affinity';
import { formatInteractionCooldown, getInteractionCooldown } from '../utils/interaction-cooldown';
import { moodToAnimationCategory } from '../utils/routine';
import { PetVitalsService } from './pet-vitals-service';
import { PetService } from './pet-service';

const INTERACTION_CONFIG: Record<
  PetInteractionTypeValue,
  { affinity: number; energyDelta: number; happinessDelta: number; animationCategory: (typeof PetAnimationCategory)[keyof typeof PetAnimationCategory] }
> = {
  [PetInteractionType.PET]: { affinity: 8, energyDelta: 0, happinessDelta: 10, animationCategory: PetAnimationCategory.HAPPY },
  [PetInteractionType.FEED]: { affinity: 5, energyDelta: 0, happinessDelta: 5, animationCategory: PetAnimationCategory.EXCITED },
  [PetInteractionType.PLAY]: { affinity: 10, energyDelta: -8, happinessDelta: 15, animationCategory: PetAnimationCategory.HAPPY },
  [PetInteractionType.TALK]: { affinity: 6, energyDelta: 0, happinessDelta: 8, animationCategory: PetAnimationCategory.IDLE },
  [PetInteractionType.TRAIN]: { affinity: 12, energyDelta: -12, happinessDelta: 6, animationCategory: PetAnimationCategory.EXCITED },
  [PetInteractionType.GIFT]: { affinity: 15, energyDelta: 0, happinessDelta: 20, animationCategory: PetAnimationCategory.EXCITED },
  [PetInteractionType.PHOTO]: { affinity: 4, energyDelta: 0, happinessDelta: 5, animationCategory: PetAnimationCategory.HAPPY },
  [PetInteractionType.ACCESSORY]: { affinity: 7, energyDelta: 0, happinessDelta: 12, animationCategory: PetAnimationCategory.HAPPY },
};

const parseCosmetics = (json: string): PetEquippedCosmetics => {
  try {
    return JSON.parse(json) as PetEquippedCosmetics;
  } catch {
    return {};
  }
};

export const PetInteractionService = {
  async setName(name: string): Promise<Pet | null> {
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return PetService.getCachedPet();

    const pet = PetService.getCachedPet() ?? (await getOrCreatePet());
    const updated: Pet = { ...pet, name: trimmed };
    await savePet(updated);
    PetService.setCachedPet(updated);
    GameEvents.emit({ type: 'PET_NAMED', name: trimmed });
    return updated;
  },

  async interact(
    type: PetInteractionTypeValue,
    options?: { foodKey?: string; toyKey?: string; cosmeticKey?: string },
  ): Promise<PetInteractionResult> {
    const pet = PetService.getCachedPet() ?? (await getOrCreatePet());
    const cooldown = getInteractionCooldown(pet.lastInteractionAt);

    if (!cooldown.canInteract) {
      const waitLabel = formatInteractionCooldown(cooldown.remainingMs);
      return {
        success: false,
        affinityGain: 0,
        animationKey: pet.currentAnimationKey,
        message: `Calma! Você já interagiu recentemente. Próxima interação em ${waitLabel}.`,
        cooldownRemainingMs: cooldown.remainingMs,
      };
    }

    const vitalBlock = PetVitalsService.getBlockMessage(pet, type);
    if (vitalBlock) {
      return {
        success: false,
        affinityGain: 0,
        animationKey: pet.currentAnimationKey,
        message: vitalBlock,
      };
    }

    const config = INTERACTION_CONFIG[type];
    const affinityMultiplier = PetVitalsService.getAffinityMultiplier(pet);
    let affinityGain = Math.max(1, Math.round(config.affinity * affinityMultiplier));
    let energy = clampVital(pet.energy + config.energyDelta);
    let hunger = pet.hunger;
    let happiness = clampVital(pet.happiness + config.happinessDelta);
    let motivation = pet.motivation;
    let equippedCosmeticsJson = pet.equippedCosmeticsJson;
    let animationCategory = config.animationCategory;

    if (type === PetInteractionType.FEED) {
      const food = PET_FOODS_BY_KEY[options?.foodKey ?? DEFAULT_FOOD_KEY];
      if (food) {
        hunger = clampVital(hunger + food.hungerRestore);
        energy = clampVital(energy + food.energyRestore);
        happiness = clampVital(happiness + food.happinessBoost);
        affinityGain += Math.max(1, Math.round(food.affinityGain * affinityMultiplier));
        animationCategory = PetAnimationCategory.EXCITED;
      }
    }

    if (type === PetInteractionType.PLAY) {
      const toy = PET_TOYS_BY_KEY[options?.toyKey ?? DEFAULT_TOY_KEY];
      if (toy) {
        energy = clampVital(energy - toy.energyCost);
        happiness = clampVital(happiness + toy.happinessBoost);
        affinityGain += Math.max(1, Math.round(toy.affinityGain * affinityMultiplier));
      }
    }

    if (type === PetInteractionType.ACCESSORY && options?.cosmeticKey) {
      const cosmetic = PET_COSMETICS_BY_KEY[options.cosmeticKey];
      if (cosmetic) {
        const equipped = parseCosmetics(pet.equippedCosmeticsJson);
        equipped[cosmetic.slot] = cosmetic.key;
        equippedCosmeticsJson = JSON.stringify(equipped);
      }
    }

    if (type === PetInteractionType.TRAIN) {
      motivation = clampVital(motivation + 12);
      await PetService.addExperience(5);
    }

    const basePet = PetService.getCachedPet() ?? pet;

    const animation =
      type === PetInteractionType.PLAY && options?.toyKey && PET_TOYS_BY_KEY[options.toyKey]
        ? PET_ANIMATIONS_BY_KEY[PET_TOYS_BY_KEY[options.toyKey].animationKey] ??
          pickRandomAnimation(animationCategory, pet.affinity)
        : pickRandomAnimation(animationCategory, pet.affinity + affinityGain);

    const dialogueContext =
      type === PetInteractionType.TALK
        ? 'english_practice'
        : type === PetInteractionType.TRAIN
          ? 'mission'
          : 'greeting';

    const dialogue = pickDialogue(dialogueContext, pet.affinity + affinityGain);
    const now = new Date().toISOString();

    const updated: Pet = {
      ...basePet,
      energy,
      hunger,
      happiness,
      motivation,
      affinity: clampAffinity(basePet.affinity + affinityGain),
      equippedCosmeticsJson,
      currentAnimationKey: animation?.key ?? DEFAULT_PET_ANIMATION_KEY,
      lastInteractionAt: now,
    };

    await savePet(updated);
    PetService.setCachedPet(updated);
    GameEvents.emit({ type: 'PET_INTERACTION', interactionType: type, affinityGain });

    return {
      success: true,
      affinityGain,
      animationKey: updated.currentAnimationKey,
      dialogueKey: dialogue.key,
      message: dialogue.text,
    };
  },

  getEquippedCosmetics(pet: Pet): PetEquippedCosmetics {
    return parseCosmetics(pet.equippedCosmeticsJson);
  },

  getInteractionCooldown(pet: Pet | null) {
    return getInteractionCooldown(pet?.lastInteractionAt ?? null);
  },
};
