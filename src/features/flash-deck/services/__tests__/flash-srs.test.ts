import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FlashCardRecord } from '@/types/flash-card';

import { FlashSrsService } from '../flash-srs-service';

const baseCard = (): FlashCardRecord => ({
  id: 'c1',
  deckId: 'deck_default',
  lemma: 'test',
  front: 'test',
  back: 'teste',
  exampleSentence: null,
  audioUri: null,
  imageUri: null,
  tags: [],
  source: 'user',
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapseCount: 0,
  dueAt: '2026-01-01T00:00:00.000Z',
  state: 'new',
  lastReviewedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  suspended: false,
});

describe('FlashSrsService', () => {
  const now = new Date('2026-06-01T12:00:00.000Z');

  it('again reschedules in ~10 minutes and increments lapses', () => {
    const patch = FlashSrsService.applyRating(baseCard(), 'again', now);
    const due = new Date(patch.dueAt).getTime();
    assert.equal(due - now.getTime(), 10 * 60 * 1000);
    assert.equal(patch.lapseCount, 1);
    assert.equal(patch.repetitions, 0);
    assert.equal(patch.state, 'relearning');
  });

  it('good on new card sets 1 day interval', () => {
    const patch = FlashSrsService.applyRating(baseCard(), 'good', now);
    assert.equal(patch.intervalDays, 1);
    assert.equal(patch.repetitions, 1);
    assert.equal(new Date(patch.dueAt).getUTCDate(), 2);
  });

  it('good on second success sets 6 day interval', () => {
    const card = { ...baseCard(), repetitions: 1, intervalDays: 1, state: 'learning' as const };
    const patch = FlashSrsService.applyRating(card, 'good', now);
    assert.equal(patch.intervalDays, 6);
    assert.equal(patch.repetitions, 2);
  });

  it('hard yields shorter interval than good on same card', () => {
    const card = { ...baseCard(), repetitions: 2, intervalDays: 6, state: 'review' as const };
    const hard = FlashSrsService.applyRating(card, 'hard', now);
    const good = FlashSrsService.applyRating(card, 'good', now);
    assert.ok(hard.intervalDays < good.intervalDays);
  });

  it('easy yields longer interval than good', () => {
    const card = { ...baseCard(), repetitions: 2, intervalDays: 6, state: 'review' as const };
    const easy = FlashSrsService.applyRating(card, 'easy', now);
    const good = FlashSrsService.applyRating(card, 'good', now);
    assert.ok(easy.intervalDays > good.intervalDays);
  });

  it('marks mature at 21+ day interval', () => {
    const card = {
      ...baseCard(),
      repetitions: 4,
      intervalDays: 20,
      state: 'review' as const,
    };
    const patch = FlashSrsService.applyRating(card, 'good', now);
    assert.ok(patch.intervalDays >= 21);
    assert.equal(patch.state, 'mature');
  });

  it('detects leech at 8 lapses', () => {
    assert.equal(FlashSrsService.isLeech({ lapseCount: 7 }), false);
    assert.equal(FlashSrsService.isLeech({ lapseCount: 8 }), true);
  });
});
