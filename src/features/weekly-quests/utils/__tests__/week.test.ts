import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getWeekBounds, isSameWeek } from '../week';

describe('getWeekBounds', () => {
  it('starts week on Monday for a Wednesday', () => {
    const bounds = getWeekBounds(new Date('2026-05-27T12:00:00'));
    assert.equal(bounds.weekStartDate, '2026-05-25');
    assert.equal(bounds.weekEndDate, '2026-05-31');
  });

  it('handles Sunday as end of the same ISO week', () => {
    const bounds = getWeekBounds(new Date('2026-05-31T12:00:00'));
    assert.equal(bounds.weekStartDate, '2026-05-25');
    assert.equal(bounds.weekEndDate, '2026-05-31');
  });
});

describe('isSameWeek', () => {
  it('returns true for dates in the same week', () => {
    assert.equal(isSameWeek('2026-05-25', '2026-05-28'), true);
  });

  it('returns false across week boundaries', () => {
    assert.equal(isSameWeek('2026-05-25', '2026-06-02'), false);
  });
});
