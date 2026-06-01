export type LemmaCompetenceSource = 'duel' | 'flash' | 'farm' | 'wall';

export type LemmaCompetenceRecord = {
  lemma: string;
  recognitionScore: number;
  grammarScore: number;
  retentionScore: number;
  transferScore: number;
  weaknessScore: number;
  timesSeen: number;
  timesCorrect: number;
  lastSeenAt: string | null;
  lastSource: LemmaCompetenceSource | null;
  updatedAt: string;
};
