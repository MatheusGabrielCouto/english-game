import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
    calculateBestStreak,
    calculateStreakAfterStudy,
    isStreakStillActive,
    shouldResetStreak,
} from '../streak';

const TODAY = '2026-05-31';
const YESTERDAY = '2026-05-30';

describe('isStreakStillActive', () => {
  it('returns false when there is no last study date', () => {
    assert.equal(isStreakStillActive(null, TODAY), false);
  });

  it('returns true when studied today or yesterday', () => {
    assert.equal(isStreakStillActive(TODAY, TODAY), true);
    assert.equal(isStreakStillActive(YESTERDAY, TODAY), true);
  });

  it('returns false when last study was before yesterday', () => {
    assert.equal(isStreakStillActive('2026-05-28', TODAY), false);
  });
});

describe('shouldResetStreak', () => {
  it('resets only when the streak is no longer active', () => {
    assert.equal(shouldResetStreak(YESTERDAY, TODAY), false);
    assert.equal(shouldResetStreak('2026-05-28', TODAY), true);
    assert.equal(shouldResetStreak(null, TODAY), false);
  });
});

describe('calculateStreakAfterStudy', () => {
  it('starts a new streak on the first study day', () => {
    assert.equal(calculateStreakAfterStudy(null, 0, TODAY), 1);
  });

  it('increments when studying on consecutive days', () => {
    assert.equal(calculateStreakAfterStudy(YESTERDAY, 3, TODAY), 4);
  });

  it('restarts after a gap', () => {
    assert.equal(calculateStreakAfterStudy('2026-05-28', 5, TODAY), 1);
  });

  it('does not change when already studied today', () => {
    assert.equal(calculateStreakAfterStudy(TODAY, 4, TODAY), 4);
  });
});

describe('calculateBestStreak', () => {
  it('keeps the highest streak value', () => {
    assert.equal(calculateBestStreak(10, 4), 10);
    assert.equal(calculateBestStreak(4, 10), 10);
  });
});
