import type { BreedingOutcome } from '../catalogs/pet-breeding-outcomes';

export type BreedingOutcomeDisplay = BreedingOutcome & {
  percent: number;
};

export const toOutcomeDisplays = (outcomes: BreedingOutcome[]): BreedingOutcomeDisplay[] => {
  const weightBySpecies = new Map<string, number>();
  for (const outcome of outcomes) {
    weightBySpecies.set(
      outcome.speciesKey,
      (weightBySpecies.get(outcome.speciesKey) ?? 0) + outcome.weight,
    );
  }

  const total = [...weightBySpecies.values()].reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return [];

  return [...weightBySpecies.entries()]
    .map(([speciesKey, weight]) => ({
      speciesKey,
      weight,
      percent: Math.round((weight / total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);
};
