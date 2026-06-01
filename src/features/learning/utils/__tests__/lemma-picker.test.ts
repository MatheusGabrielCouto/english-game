import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pickLemmasWithWeakSpacedMix } from '../lemma-picker';

describe('pickLemmasWithWeakSpacedMix', () => {
  it('uses ~70% weak and ~30% spaced for count 10', () => {
    const weak = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const spaced = ['i', 'j', 'k', 'l'];

    const { picked, weakCount, spacedCount } = pickLemmasWithWeakSpacedMix(
      weak,
      spaced,
      10,
      'test-seed',
    );

    assert.equal(picked.length, 10);
    assert.equal(weakCount, 7);
    assert.equal(spacedCount, 3);
    assert.equal(weakCount + spacedCount, 10);
  });

  it('never duplicates lemmas in the mix', () => {
    const { picked } = pickLemmasWithWeakSpacedMix(
      ['apple', 'airport', 'ticket'],
      ['map', 'travel', 'passport'],
      5,
      'dedupe-seed',
    );

    assert.equal(new Set(picked).size, picked.length);
  });
});
