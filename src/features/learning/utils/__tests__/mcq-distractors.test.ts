import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LEMMA_POOL } from '@/data/loaders/lemma-pool';

import {
  buildMcqQuestion,
  validateMcqAnswer,
} from '../../services/mcq-question-builder';
import { choicesAreDistinct, pickLemmaDistractors } from '../mcq-distractors';

describe('mcq distractors', () => {
  it('picks distractors different from the correct lemma', () => {
    const distractors = pickLemmaDistractors('travel', LEMMA_POOL, 3, 'travel-seed');
    assert.equal(distractors.length, 3);
    assert.ok(distractors.every((lemma) => lemma !== 'travel'));
  });

  it('buildMcq returns 4 distinct choices with one correct answer', () => {
    const question = buildMcqQuestion({
      type: 'mcq_meaning',
      lemma: 'travel',
      patent: 'tourist',
      packKey: 'a1-travel',
    });

    assert.equal(question.prompt.choices.length, 4);
    assert.ok(choicesAreDistinct(question.prompt.choices));
    assert.ok(question.prompt.correctIndex >= 0 && question.prompt.correctIndex <= 3);
    assert.equal(
      question.prompt.choices[question.prompt.correctIndex]?.toLowerCase(),
      'viagem',
    );
  });

  it('validateAnswer matches correctIndex only', () => {
    const question = buildMcqQuestion({
      type: 'mcq_translation',
      lemma: 'ticket',
      patent: 'tourist',
      packKey: 'a1-travel',
    });

    assert.equal(validateMcqAnswer(question.prompt, question.prompt.correctIndex), true);
    const wrongIndex = question.prompt.correctIndex === 0 ? 1 : 0;
    assert.equal(validateMcqAnswer(question.prompt, wrongIndex), false);
  });
});
