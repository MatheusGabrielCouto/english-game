import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PetMood } from '@/types/pet';

import { isNegativeMood, isPositiveMood, resolveMoodFromStreak } from '../mood';

describe('resolveMoodFromStreak', () => {
  it('returns VERY_SAD when streak is zero', () => {
    assert.equal(resolveMoodFromStreak(0), PetMood.VERY_SAD);
  });

  it('returns SAD for low streak', () => {
    assert.equal(resolveMoodFromStreak(2), PetMood.SAD);
  });

  it('returns NORMAL for moderate streak', () => {
    assert.equal(resolveMoodFromStreak(5), PetMood.NORMAL);
  });

  it('returns HAPPY for good streak', () => {
    assert.equal(resolveMoodFromStreak(10), PetMood.HAPPY);
  });

  it('returns VERY_HAPPY for excellent streak', () => {
    assert.equal(resolveMoodFromStreak(20), PetMood.VERY_HAPPY);
  });
});

describe('mood helpers', () => {
  it('identifies positive moods', () => {
    assert.equal(isPositiveMood(PetMood.HAPPY), true);
    assert.equal(isPositiveMood(PetMood.SAD), false);
  });

  it('identifies negative moods', () => {
    assert.equal(isNegativeMood(PetMood.VERY_SAD), true);
    assert.equal(isNegativeMood(PetMood.NORMAL), false);
  });
});
