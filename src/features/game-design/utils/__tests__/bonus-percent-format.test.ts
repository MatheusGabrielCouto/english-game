import assert from 'node:assert';
import { describe, it } from 'node:test';

import { formatBonusPercent, roundBonusPercent } from '../bonus-percent-format';

describe('roundBonusPercent', () => {
  it('rounds to two decimal places', () => {
    assert.equal(roundBonusPercent(7.351619900031), 7.35);
    assert.equal(roundBonusPercent(7.426), 7.43);
  });
});

describe('formatBonusPercent', () => {
  it('formats integers without decimals', () => {
    assert.equal(formatBonusPercent(10), '+10%');
  });

  it('formats fractional values with two decimals', () => {
    assert.equal(formatBonusPercent(7.351619900031), '+7.35%');
    assert.equal(formatBonusPercent(7.426), '+7.43%');
  });
});
