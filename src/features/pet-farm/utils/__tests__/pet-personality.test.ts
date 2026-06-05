import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PET_PERSONALITY_DIALOGUES } from '../../catalogs/pet-personality-dialogues';
import { PET_PERSONALITY_KEYS } from '../../catalogs/pet-personalities-catalog';

describe('pet-personality', () => {
  it('catalog has 30 personalities', () => {
    assert.equal(PET_PERSONALITY_KEYS.length, 30);
  });

  it('has greeting dialogue per personality', () => {
    for (const key of PET_PERSONALITY_KEYS) {
      const line = PET_PERSONALITY_DIALOGUES.find(
        (entry) => entry.context === 'greeting' && entry.personalityKeys?.includes(key),
      );
      assert.ok(line, `missing greeting for ${key}`);
    }
  });

  it('has english_practice dialogue per personality', () => {
    for (const key of PET_PERSONALITY_KEYS) {
      const line = PET_PERSONALITY_DIALOGUES.find(
        (entry) =>
          entry.context === 'english_practice' && entry.personalityKeys?.includes(key),
      );
      assert.ok(line, `missing practice line for ${key}`);
    }
  });
});
