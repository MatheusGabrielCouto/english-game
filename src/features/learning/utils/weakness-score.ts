const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export type CompetenceScores = {
  recognitionScore: number;
  grammarScore: number;
  retentionScore: number;
  transferScore: number;
};

/** Higher = weaker lemma (needs more practice). */
export const computeWeaknessScore = (scores: CompetenceScores): number => {
  const recognition = clamp01(scores.recognitionScore);
  const grammar = clamp01(scores.grammarScore);
  const retention = clamp01(scores.retentionScore);
  const transfer = clamp01(scores.transferScore);

  const raw =
    0.35 * (1 - recognition) +
    0.35 * (1 - retention) +
    0.15 * (1 - grammar) +
    0.15 * (1 - transfer);

  return clamp01(raw);
};

export const bumpScore = (current: number, delta: number): number => clamp01(current + delta);
