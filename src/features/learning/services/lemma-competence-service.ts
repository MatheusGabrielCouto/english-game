import type { FlashSrsRating } from '@/types/flash-card';
import type { LemmaCompetenceRecord, LemmaCompetenceSource } from '@/types/lemma-competence';

import { LemmaCompetenceRepository } from '@/storage/repositories/lemma-competence-repository';
import type { GameEvent } from '@/services/game-events';
import { GameEvents } from '@/services/game-events';

import { normalizeLemma } from '../utils/lemma-normalize';
import { bumpScore, computeWeaknessScore } from '../utils/weakness-score';

const nowIso = () => new Date().toISOString();

const defaultRecord = (lemma: string, source: LemmaCompetenceSource): LemmaCompetenceRecord => ({
  lemma,
  recognitionScore: 0,
  grammarScore: 0,
  retentionScore: 0,
  transferScore: 0,
  weaknessScore: 0.5,
  timesSeen: 0,
  timesCorrect: 0,
  lastSeenAt: null,
  lastSource: source,
  updatedAt: nowIso(),
});

const withWeakness = (record: LemmaCompetenceRecord): LemmaCompetenceRecord => ({
  ...record,
  weaknessScore: computeWeaknessScore(record),
  updatedAt: nowIso(),
});

let listenersInitialized = false;

const isGoodPlusRating = (rating: FlashSrsRating): boolean =>
  rating === 'good' || rating === 'easy';

export const LemmaCompetenceService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      if (event.type !== 'WORDS_LEARNED') return;

      for (const word of event.words ?? []) {
        const lemma = normalizeLemma(word.term);
        if (!lemma) continue;
        void LemmaCompetenceService.recordExposure(lemma, 'farm');
      }
    });
  },

  async get(lemma: string): Promise<LemmaCompetenceRecord | null> {
    const key = normalizeLemma(lemma);
    if (!key) return null;
    return LemmaCompetenceRepository.get(key);
  },

  async recordExposure(
    lemmaInput: string,
    source: LemmaCompetenceSource = 'farm',
  ): Promise<LemmaCompetenceRecord | null> {
    const lemma = normalizeLemma(lemmaInput);
    if (!lemma) return null;

    const existing = (await LemmaCompetenceRepository.get(lemma)) ?? defaultRecord(lemma, source);

    const updated = withWeakness({
      ...existing,
      recognitionScore: bumpScore(existing.recognitionScore, 0.12),
      retentionScore: bumpScore(existing.retentionScore, 0.05),
      timesSeen: existing.timesSeen + 1,
      lastSeenAt: nowIso(),
      lastSource: source,
    });

    await LemmaCompetenceRepository.upsert(updated);
    return updated;
  },

  async recordFlashReview(
    lemmaInput: string,
    rating: FlashSrsRating,
  ): Promise<LemmaCompetenceRecord | null> {
    const lemma = normalizeLemma(lemmaInput);
    if (!lemma) return null;

    const existing = (await LemmaCompetenceRepository.get(lemma)) ?? defaultRecord(lemma, 'flash');

    let retentionDelta = 0;
    if (rating === 'again') {
      retentionDelta = -0.12;
    } else if (rating === 'hard') {
      retentionDelta = 0.05;
    } else if (rating === 'good') {
      retentionDelta = 0.15;
    } else if (rating === 'easy') {
      retentionDelta = 0.22;
    }

    const updated = withWeakness({
      ...existing,
      retentionScore: bumpScore(existing.retentionScore, retentionDelta),
      recognitionScore: isGoodPlusRating(rating)
        ? bumpScore(existing.recognitionScore, 0.08)
        : existing.recognitionScore,
      timesSeen: existing.timesSeen + 1,
      timesCorrect: isGoodPlusRating(rating) ? existing.timesCorrect + 1 : existing.timesCorrect,
      lastSeenAt: nowIso(),
      lastSource: 'flash',
    });

    await LemmaCompetenceRepository.upsert(updated);
    return updated;
  },

  async recordDuelAnswer(
    lemmaInput: string,
    isCorrect: boolean,
  ): Promise<LemmaCompetenceRecord | null> {
    const lemma = normalizeLemma(lemmaInput);
    if (!lemma) return null;

    const existing = (await LemmaCompetenceRepository.get(lemma)) ?? defaultRecord(lemma, 'duel');

    const updated = withWeakness({
      ...existing,
      recognitionScore: bumpScore(existing.recognitionScore, isCorrect ? 0.14 : -0.06),
      grammarScore: bumpScore(existing.grammarScore, isCorrect ? 0.1 : -0.04),
      timesSeen: existing.timesSeen + 1,
      timesCorrect: isCorrect ? existing.timesCorrect + 1 : existing.timesCorrect,
      lastSeenAt: nowIso(),
      lastSource: 'duel',
    });

    await LemmaCompetenceRepository.upsert(updated);
    return updated;
  },

  async getWeakLemmas(limit: number): Promise<LemmaCompetenceRecord[]> {
    if (limit <= 0) return [];
    return LemmaCompetenceRepository.listWeakLemmas(limit);
  },

  async getSpacedLemmas(limit: number): Promise<LemmaCompetenceRecord[]> {
    if (limit <= 0) return [];
    return LemmaCompetenceRepository.listSpacedLemmas(limit);
  },
};
