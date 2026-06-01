import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyShieldProtection, getMissedStudyDates } from '../shield';

describe('getMissedStudyDates', () => {
  it('returns empty when last study was yesterday', () => {
    assert.deepEqual(getMissedStudyDates('2026-05-30', '2026-05-31'), []);
  });

  it('returns one missed day when one day was skipped', () => {
    assert.deepEqual(getMissedStudyDates('2026-05-29', '2026-05-31'), ['2026-05-30']);
  });

  it('returns all missed days between last study and yesterday', () => {
    assert.deepEqual(getMissedStudyDates('2026-05-28', '2026-05-31'), [
      '2026-05-29',
      '2026-05-30',
    ]);
  });
});

describe('applyShieldProtection', () => {
  const basePlayer = {
    currentStreak: 20,
    shields: 1,
    lastStudyDate: '2026-05-29',
  };

  it('preserves streak when one shield covers one missed day', () => {
    const result = applyShieldProtection(basePlayer, ['2026-05-30']);

    assert.equal(result.currentStreak, 20);
    assert.equal(result.shields, 0);
    assert.equal(result.shieldsConsumed, 1);
    assert.equal(result.streakBroken, false);
    assert.equal(result.lastStudyDate, '2026-05-30');
  });

  it('breaks streak when no shields are available', () => {
    const result = applyShieldProtection(
      { ...basePlayer, shields: 0 },
      ['2026-05-30'],
    );

    assert.equal(result.currentStreak, 0);
    assert.equal(result.shieldsConsumed, 0);
    assert.equal(result.streakBroken, true);
  });

  it('consumes multiple shields for consecutive missed days', () => {
    const result = applyShieldProtection(
      { ...basePlayer, shields: 2, lastStudyDate: '2026-05-28' },
      ['2026-05-29', '2026-05-30'],
    );

    assert.equal(result.currentStreak, 20);
    assert.equal(result.shields, 0);
    assert.equal(result.shieldsConsumed, 2);
    assert.equal(result.lastStudyDate, '2026-05-30');
  });

  it('breaks streak when shields run out mid-gap', () => {
    const result = applyShieldProtection(
      { ...basePlayer, shields: 1, lastStudyDate: '2026-05-28' },
      ['2026-05-29', '2026-05-30'],
    );

    assert.equal(result.currentStreak, 0);
    assert.equal(result.shields, 0);
    assert.equal(result.shieldsConsumed, 1);
    assert.equal(result.streakBroken, true);
  });
});
