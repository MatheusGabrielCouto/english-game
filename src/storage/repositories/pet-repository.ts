import { eq } from 'drizzle-orm';

import { PetMood, PetStage, type Pet, type PetStageValue } from '@/types/pet';

import { getDb } from '../database/client';
import { pets } from '../database/schema';

const mapRow = (row: typeof pets.$inferSelect): Pet => ({
  id: row.id,
  stage: row.stage as PetStageValue,
  mood: row.mood as Pet['mood'],
  experience: row.experience,
  level: row.level,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  speciesKey: row.speciesKey,
  name: row.name,
  energy: row.energy,
  hunger: row.hunger,
  happiness: row.happiness,
  motivation: row.motivation,
  affinity: row.affinity,
  isIncubating: row.isIncubating,
  hatchAt: row.hatchAt ?? null,
  equippedCosmeticsJson: row.equippedCosmeticsJson,
  lastInteractionAt: row.lastInteractionAt ?? null,
  routinePhase: row.routinePhase,
  currentAnimationKey: row.currentAnimationKey,
});

const createDefaultPet = (): Omit<Pet, 'id'> => {
  const now = new Date().toISOString();
  return {
    stage: PetStage.EGG,
    mood: PetMood.NORMAL,
    experience: 0,
    level: 1,
    createdAt: now,
    updatedAt: now,
    speciesKey: 'codeowl',
    name: 'Buddy',
    energy: 100,
    hunger: 100,
    happiness: 100,
    motivation: 100,
    affinity: 0,
    isIncubating: false,
    hatchAt: null,
    equippedCosmeticsJson: '{}',
    lastInteractionAt: null,
    routinePhase: 'morning',
    currentAnimationKey: 'idle_respirando_v1',
  };
};

export const getCurrentPet = async (): Promise<Pet | null> => {
  const db = getDb();
  const rows = await db.select().from(pets).limit(1);
  return rows[0] ? mapRow(rows[0]) : null;
};

export const getOrCreatePet = async (): Promise<Pet> => {
  const existing = await getCurrentPet();
  if (existing) return existing;

  const db = getDb();
  const defaults = createDefaultPet();
  const rows = await db.insert(pets).values(defaults).returning();
  return mapRow(rows[0]);
};

export const savePet = async (pet: Pet): Promise<void> => {
  const db = getDb();
  await db
    .update(pets)
    .set({
      stage: pet.stage,
      mood: pet.mood,
      experience: pet.experience,
      level: pet.level,
      speciesKey: pet.speciesKey,
      name: pet.name,
      energy: pet.energy,
      hunger: pet.hunger,
      happiness: pet.happiness,
      motivation: pet.motivation,
      affinity: pet.affinity,
      isIncubating: pet.isIncubating,
      hatchAt: pet.hatchAt,
      equippedCosmeticsJson: pet.equippedCosmeticsJson,
      lastInteractionAt: pet.lastInteractionAt,
      routinePhase: pet.routinePhase,
      currentAnimationKey: pet.currentAnimationKey,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(pets.id, pet.id));
};
