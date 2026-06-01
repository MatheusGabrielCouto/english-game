import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeReviewStreakDays } from '../review-streak';

describe('computeReviewStreakDays', () => {
  const now = new Date('2026-06-03T12:00:00.000Z');

  it('returns 0 when no reviews', () => {
    assert.equal(computeReviewStreakDays([], now), 0);
  });

  it('counts consecutive days ending today', () => {
    assert.equal(computeReviewStreakDays(['2026-06-03', '2026-06-02', '2026-06-01'], now), 3);
  });

  it('counts from yesterday when today has no review', () => {
    assert.equal(computeReviewStreakDays(['2026-06-02', '2026-06-01'], now), 2);
  });
});
