import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PET_INTERACTION_COOLDOWN_MS } from '../../constants';
import { formatInteractionCooldown, getInteractionCooldown } from '../interaction-cooldown';

describe('getInteractionCooldown', () => {
  it('allows interaction when never interacted', () => {
    const result = getInteractionCooldown(null);
    assert.equal(result.canInteract, true);
    assert.equal(result.remainingMs, 0);
  });

  it('blocks interaction within cooldown window', () => {
    const now = Date.parse('2026-05-31T12:00:00.000Z');
    const last = new Date(now - 3 * 60_000).toISOString();
    const result = getInteractionCooldown(last, now);
    assert.equal(result.canInteract, false);
    assert.equal(result.remainingMs, 2 * 60_000);
  });

  it('allows interaction after cooldown expires', () => {
    const now = Date.parse('2026-05-31T12:00:00.000Z');
    const last = new Date(now - PET_INTERACTION_COOLDOWN_MS).toISOString();
    const result = getInteractionCooldown(last, now);
    assert.equal(result.canInteract, true);
    assert.equal(result.remainingMs, 0);
  });
});

describe('formatInteractionCooldown', () => {
  it('formats minutes under one hour', () => {
    assert.equal(formatInteractionCooldown(45 * 60_000), '45min');
  });

  it('formats hours and minutes', () => {
    assert.equal(formatInteractionCooldown(90 * 60_000), '1h 30min');
  });
});
