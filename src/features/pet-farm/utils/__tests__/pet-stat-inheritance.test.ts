import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { inheritStatsFromParents } from '../pet-stat-inheritance';

describe('inheritStatsFromParents', () => {
  const mother = { strength: 14, focus: 20, luck: 10, resilience: 12, charm: 11 };
  const father = { strength: 20, focus: 12, luck: 15, resilience: 10, charm: 13 };

  it('inherits at least max of parents per stat', () => {
    const child = inheritStatsFromParents(mother, father, 'codeowl');
    assert.ok(child.strength >= 20);
    assert.ok(child.focus >= 20);
  });

  it('can exceed parent strength when roll-up applies', () => {
    const rolls: number[] = [];
    const original = Math.random;
    Math.random = () => {
      rolls.push(rolls.length === 0 ? 0.9 : 0.5);
      return rolls[rolls.length - 1] ?? 0.5;
    };
    try {
      const child = inheritStatsFromParents(mother, father, 'codeowl');
      assert.ok(child.strength >= 20);
    } finally {
      Math.random = original;
    }
  });
});
