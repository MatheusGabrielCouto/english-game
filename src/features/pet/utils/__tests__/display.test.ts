import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PetMood, PetStage, type Pet } from '@/types/pet';

import { getPetDexEntryDisplay, getPetDisplayInfo, isPetIncubating } from '../display';

const basePet = (): Pet => ({
  id: 1,
  stage: PetStage.EGG,
  mood: PetMood.NORMAL,
  experience: 0,
  level: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  speciesKey: 'codeowl',
  name: 'Buddy',
  energy: 100,
  hunger: 100,
  happiness: 100,
  motivation: 100,
  affinity: 0,
  isIncubating: false,
  hatchAt: null,
  equippedCosmeticsJson: '{}',
  lastInteractionAt: null,
  routinePhase: 'morning',
  currentAnimationKey: 'idle_respirando_v1',
});

describe('isPetIncubating', () => {
  it('returns true for egg stage', () => {
    assert.equal(isPetIncubating(basePet()), true);
  });

  it('returns false after hatch', () => {
    assert.equal(isPetIncubating({ ...basePet(), stage: PetStage.BABY, level: 5 }), false);
  });
});

describe('getPetDisplayInfo', () => {
  it('shows species emoji while still in egg stage', () => {
    assert.equal(getPetDisplayInfo(basePet()).displayEmoji, '🦉');
    assert.equal(getPetDisplayInfo(basePet()).stageLabel, 'Ovo');
  });

  it('shows species emoji after hatch', () => {
    assert.equal(
      getPetDisplayInfo({ ...basePet(), stage: PetStage.BABY, level: 5 }).displayEmoji,
      '🦉',
    );
  });
});

describe('getPetDexEntryDisplay', () => {
  it('shows owl for active egg-stage pet', () => {
    const entry = getPetDexEntryDisplay('codeowl', basePet(), false);
    assert.equal(entry.emoji, '🦉');
    assert.equal(entry.isActive, true);
    assert.equal(entry.isIncubating, true);
    assert.equal(entry.subtitle, 'Ovo · seu pet');
  });

  it('shows species emoji for discovered inactive entry', () => {
    const entry = getPetDexEntryDisplay('debugduck', basePet(), true);
    assert.equal(entry.emoji, '🦆');
    assert.equal(entry.isActive, false);
  });

  it('hides undiscovered species', () => {
    const entry = getPetDexEntryDisplay('gitcat', basePet(), false);
    assert.equal(entry.emoji, '❓');
    assert.equal(entry.name, '???');
  });
});
