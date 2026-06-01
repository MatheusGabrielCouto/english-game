import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';

/** 70% weak lemmas + 30% spaced (stronger) lemmas for question variety. */
export const pickLemmasWithWeakSpacedMix = (
  weakLemmas: string[],
  spacedLemmas: string[],
  count: number,
  seed: string,
): { picked: string[]; weakCount: number; spacedCount: number } => {
  if (count <= 0) {
    return { picked: [], weakCount: 0, spacedCount: 0 };
  }

  const weakTarget = Math.ceil(count * 0.7);
  const weak = pickDeterministicSubset(
    weakLemmas,
    Math.min(weakTarget, weakLemmas.length),
    `${seed}-weak`,
  );

  const spacedPool = spacedLemmas.filter((lemma) => !weak.includes(lemma));
  const spacedNeeded = count - weak.length;
  const spaced = pickDeterministicSubset(
    spacedPool,
    Math.min(spacedNeeded, spacedPool.length),
    `${seed}-spaced`,
  );

  const picked = pickDeterministicSubset(
    [...weak, ...spaced],
    Math.min(count, weak.length + spaced.length),
    `${seed}-mix`,
  );

  return {
    picked,
    weakCount: weak.length,
    spacedCount: spaced.length,
  };
};
