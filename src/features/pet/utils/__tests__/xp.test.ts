import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PetStage } from '@/types/pet';

import { applyPetExperience, getRequiredPetXP, resolveStageFromLevel } from '../xp';

describe('getRequiredPetXP', () => {
  it('uses level times PET_XP_PER_LEVEL (35)', () => {
    assert.equal(getRequiredPetXP(1), 35);
    assert.equal(getRequiredPetXP(4), 140);
  });
});

describe('applyPetExperience', () => {
  it('levels up pet when enough XP is gained', () => {
    const result = applyPetExperience(4, 100, 50);

    assert.equal(result.level, 5);
    assert.equal(result.experience, 10);
    assert.equal(result.levelsGained, 1);
  });

  it('handles chained level ups', () => {
    const result = applyPetExperience(1, 0, 200);

    assert.equal(result.level, 3);
    assert.equal(result.levelsGained, 2);
  });

  it('normalizes overflow XP without adding amount', () => {
    const result = applyPetExperience(3, 140, 0);

    assert.equal(result.level, 4);
    assert.equal(result.experience, 35);
    assert.equal(result.levelsGained, 1);
  });
});

describe('resolveStageFromLevel', () => {
  it('returns Baby at level 5', () => {
    assert.equal(resolveStageFromLevel(5), PetStage.BABY);
  });

  it('returns Legendary at level 50', () => {
    assert.equal(resolveStageFromLevel(50), PetStage.LEGENDARY);
  });

  it('returns Egg below level 5', () => {
    assert.equal(resolveStageFromLevel(4), PetStage.EGG);
  });
});
