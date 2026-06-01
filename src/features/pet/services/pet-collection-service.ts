import { eq } from 'drizzle-orm';

import { PET_SPECIES_BY_KEY, PET_SPECIES_CATALOG } from '@/features/game-design/catalogs/pet-species-catalog';
import { STAGE_CONFIG, STAGE_ORDER } from '@/features/pet/constants';
import { getPetDexEntryDisplay, isPetIncubating } from '@/features/pet/utils/display';
import { getDb } from '@/storage/database/client';
import { petCollection } from '@/storage/database/schema';
import type { Pet, PetStageValue } from '@/types/pet';
import { PetStage } from '@/types/pet';

export type PetCollectionEntry = {
  speciesKey: string;
  name: string;
  emoji: string;
  subtitle: string;
  rarity: string;
  discovered: boolean;
  discoveredAt: string | null;
  passiveLabel: string;
  isActive: boolean;
  isIncubating: boolean;
  stages: { stage: PetStageValue; label: string; emoji: string; minLevel: number }[];
};

export const PetCollectionService = {
  /** Removes dex entry registered before hatch (legacy bug). */
  async reconcilePrematureDiscovery(pet: Pet): Promise<void> {
    if (!isPetIncubating(pet)) return;

    const db = getDb();
    await db.delete(petCollection).where(eq(petCollection.speciesKey, pet.speciesKey));
  },

  async ensureSpeciesDiscovered(speciesKey: string): Promise<void> {
    const db = getDb();
    const now = new Date().toISOString();
    const existing = await db
      .select()
      .from(petCollection)
      .where(eq(petCollection.speciesKey, speciesKey))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(petCollection)
        .set({ timesOwned: existing[0].timesOwned + 1 })
        .where(eq(petCollection.speciesKey, speciesKey));
      return;
    }

    await db.insert(petCollection).values({
      speciesKey,
      discoveredAt: now,
      timesOwned: 1,
    });
  },

  async getCollection(currentPet: Pet | null = null): Promise<PetCollectionEntry[]> {
    const db = getDb();
    const rows = await db.select().from(petCollection);
    const discoveredMap = new Map(rows.map((row) => [row.speciesKey, row.discoveredAt]));

    return PET_SPECIES_CATALOG.map((species) => {
      const discoveredInDb = discoveredMap.has(species.key);
      const dexDisplay = getPetDexEntryDisplay(species.key, currentPet, discoveredInDb);
      const visible = dexDisplay.isActive || dexDisplay.speciesDiscovered;

      return {
        speciesKey: species.key,
        name: dexDisplay.name,
        emoji: dexDisplay.emoji,
        subtitle: dexDisplay.subtitle,
        rarity: species.rarity,
        discovered: visible,
        discoveredAt: discoveredMap.get(species.key) ?? null,
        passiveLabel: species.passive.label,
        isActive: dexDisplay.isActive,
        isIncubating: dexDisplay.isIncubating,
        stages: STAGE_ORDER.map((stage) => ({
          stage,
          label: STAGE_CONFIG[stage].label,
          emoji: STAGE_CONFIG[stage].emoji,
          minLevel: STAGE_CONFIG[stage].minLevel,
        })),
      };
    });
  },

  getSpeciesDefinition(speciesKey: string) {
    return PET_SPECIES_BY_KEY[speciesKey] ?? PET_SPECIES_BY_KEY.codeowl;
  },
};

/** @deprecated Use ensureSpeciesDiscovered after hatch */
export const ensureCurrentSpeciesDiscovered = async (speciesKey: string): Promise<void> => {
  await PetCollectionService.ensureSpeciesDiscovered(speciesKey);
};
