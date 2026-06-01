import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FlashCardRecord } from '@/types/flash-card';

import {
    cardMatchesSearch,
    cardMatchesTag,
    collectTagsFromCards,
    parseTagsInput,
} from '../flash-card-search';

const baseCard = (overrides: Partial<FlashCardRecord> = {}): FlashCardRecord => ({
  id: 'flash_card_test',
  deckId: 'deck_a',
  lemma: 'reluctant',
  front: 'reluctant',
  back: 'relutante',
  exampleSentence: 'She was reluctant to leave.',
  audioUri: null,
  imageUri: null,
  tags: ['viagem', 'work'],
  source: 'user',
  state: 'new',
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapseCount: 0,
  dueAt: new Date().toISOString(),
  lastReviewedAt: null,
  createdAt: new Date().toISOString(),
  suspended: false,
  ...overrides,
});

describe('flash-card-search', () => {
  it('matches front, back, lemma, example and tags', () => {
    const card = baseCard();
    assert.equal(cardMatchesSearch(card, 'relut'), true);
    assert.equal(cardMatchesSearch(card, 'reluct'), true);
    assert.equal(cardMatchesSearch(card, 'leave'), true);
    assert.equal(cardMatchesSearch(card, 'viagem'), true);
    assert.equal(cardMatchesSearch(card, 'zzz'), false);
  });

  it('filters by exact tag', () => {
    const card = baseCard();
    assert.equal(cardMatchesTag(card, 'work'), true);
    assert.equal(cardMatchesTag(card, 'WORK'), true);
    assert.equal(cardMatchesTag(card, 'viagem'), true);
    assert.equal(cardMatchesTag(card, 'other'), false);
    assert.equal(cardMatchesTag(card, null), true);
  });

  it('parses tags from comma, semicolon and hash', () => {
    assert.deepEqual(parseTagsInput('viagem, work; #verbo'), ['viagem', 'work', 'verbo']);
  });

  it('collects sorted unique tags', () => {
    const tags = collectTagsFromCards([
      baseCard({ tags: ['b', 'a'] }),
      baseCard({ id: 'c2', tags: ['a', 'c'] }),
    ]);
    assert.deepEqual(tags, ['a', 'b', 'c']);
  });
});
