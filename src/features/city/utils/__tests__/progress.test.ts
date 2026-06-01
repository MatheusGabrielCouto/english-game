import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildCityProgress,
  getEligibleBuildings,
  getNextBuilding,
  resolveBuildingForLevel,
} from '../progress';

describe('resolveBuildingForLevel', () => {
  it('returns House at level 1', () => {
    assert.equal(resolveBuildingForLevel(1).name, 'House');
  });

  it('returns Office at level 5', () => {
    assert.equal(resolveBuildingForLevel(5).name, 'Office');
  });

  it('returns Financial Center at level 100', () => {
    assert.equal(resolveBuildingForLevel(100).name, 'Financial Center');
  });

  it('keeps highest building below next threshold', () => {
    assert.equal(resolveBuildingForLevel(29).name, 'Company');
    assert.equal(resolveBuildingForLevel(30).name, 'Airport');
  });
});

describe('getNextBuilding', () => {
  it('returns the next building milestone', () => {
    assert.equal(getNextBuilding(4)?.name, 'Office');
    assert.equal(getNextBuilding(100), null);
  });
});

describe('getEligibleBuildings', () => {
  it('includes all buildings up to current level', () => {
    assert.equal(getEligibleBuildings(10).length, 3);
    assert.equal(getEligibleBuildings(1).length, 1);
  });
});

describe('buildCityProgress', () => {
  it('builds progress toward next building', () => {
    const progress = buildCityProgress(12);
    assert.equal(progress.currentBuilding.name, 'Startup');
    assert.equal(progress.nextBuilding?.name, 'Company');
    assert.equal(progress.levelsUntilNext, 8);
  });

  it('handles fully developed city', () => {
    const progress = buildCityProgress(100);
    assert.equal(progress.nextBuilding, null);
    assert.equal(progress.levelsUntilNext, null);
  });
});
