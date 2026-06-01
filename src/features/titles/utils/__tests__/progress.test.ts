import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
    buildTitleProgress,
    getEligibleTitles,
    getNextTitle,
    resolveTitleForLevel,
} from '../progress';

describe('resolveTitleForLevel', () => {
  it('returns Local Developer at level 1', () => {
    assert.equal(resolveTitleForLevel(1).name, 'Local Developer');
  });

  it('returns Junior Remote Developer at level 5', () => {
    assert.equal(resolveTitleForLevel(5).name, 'Junior Remote Developer');
  });

  it('returns World Class Engineer at level 100', () => {
    assert.equal(resolveTitleForLevel(100).name, 'World Class Engineer');
  });

  it('keeps highest title below next threshold', () => {
    assert.equal(resolveTitleForLevel(19).name, 'Mid Remote Developer');
    assert.equal(resolveTitleForLevel(20).name, 'Senior Remote Developer');
  });
});

describe('getNextTitle', () => {
  it('returns the next milestone', () => {
    assert.equal(getNextTitle(4)?.name, 'Junior Remote Developer');
    assert.equal(getNextTitle(100), null);
  });
});

describe('getEligibleTitles', () => {
  it('includes all titles up to current level', () => {
    assert.equal(getEligibleTitles(10).length, 3);
    assert.equal(getEligibleTitles(1).length, 1);
  });
});

describe('buildTitleProgress', () => {
  it('builds progress toward next title', () => {
    const progress = buildTitleProgress(12);
    assert.equal(progress.currentTitle.name, 'Mid Remote Developer');
    assert.equal(progress.nextTitle?.name, 'Senior Remote Developer');
    assert.equal(progress.levelsUntilNext, 8);
  });

  it('handles max title progression', () => {
    const progress = buildTitleProgress(100);
    assert.equal(progress.nextTitle, null);
    assert.equal(progress.levelsUntilNext, null);
  });
});
