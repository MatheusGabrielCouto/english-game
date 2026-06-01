import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveQuestionTimeLimitSec } from '../duel-timer';

describe('duel-timer', () => {
  it('enables timer from intern patent', () => {
    assert.equal(resolveQuestionTimeLimitSec('intern'), 15);
    assert.equal(resolveQuestionTimeLimitSec('resident'), null);
  });
});
