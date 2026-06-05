export const PET_GENERATION_MAX = 999;

export const computeChildGeneration = (
  motherGeneration: number | null | undefined,
  fatherGeneration: number | null | undefined,
): number => {
  const hasMother = motherGeneration != null && motherGeneration > 0;
  const hasFather = fatherGeneration != null && fatherGeneration > 0;
  if (!hasMother && !hasFather) return 1;
  const base = Math.max(motherGeneration ?? 1, fatherGeneration ?? 1);
  return Math.min(PET_GENERATION_MAX, base + 1);
};

export const isWildGeneration = (generation: number): boolean => generation <= 1;

export type PetGenVisualTier = 'base' | 'bronze' | 'silver' | 'gold' | 'mythic' | 'legacy';

export const getPetGenVisualTier = (generation: number): PetGenVisualTier => {
  if (generation >= 100) return 'legacy';
  if (generation >= 50) return 'mythic';
  if (generation >= 25) return 'gold';
  if (generation >= 10) return 'silver';
  if (generation >= 5) return 'bronze';
  return 'base';
};

export const getPetGenTierLabel = (generation: number): string | null => {
  if (generation >= 100) return 'Legacy';
  if (generation >= 50) return 'Mítico';
  if (generation >= 25) return 'Ouro';
  if (generation >= 10) return 'Prata';
  if (generation >= 5) return 'Bronze';
  return null;
};
