import assert from 'node:assert';
import { describe, it } from 'node:test';

import { groupTimelineItems, resolveTimelineGroupKey } from '../timeline-group';

describe('resolveTimelineGroupKey', () => {
  const now = new Date('2026-06-04T15:00:00');

  it('classifies today', () => {
    assert.equal(resolveTimelineGroupKey('2026-06-04T10:00:00', now), 'today');
  });

  it('classifies yesterday', () => {
    assert.equal(resolveTimelineGroupKey('2026-06-03T10:00:00', now), 'yesterday');
  });
});

describe('groupTimelineItems', () => {
  it('orders groups and sorts items newest first within group', () => {
    const now = new Date('2026-06-04T15:00:00');
    const groups = groupTimelineItems([
      { unlockedAt: '2026-05-01T00:00:00', id: 'old' },
      { unlockedAt: '2026-06-04T08:00:00', id: 'today-a' },
      { unlockedAt: '2026-06-04T12:00:00', id: 'today-b' },
    ]);

    assert.equal(groups[0]?.key, 'today');
    assert.equal(groups[0]?.items[0]?.id, 'today-b');
    assert.equal(groups[groups.length - 1]?.key, 'older');
    void now;
  });
});
