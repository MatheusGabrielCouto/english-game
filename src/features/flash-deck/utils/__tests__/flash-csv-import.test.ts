import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseFlashCardsCsv } from '../flash-csv-import';

describe('flash-csv-import', () => {
  it('parses header and rows', () => {
    const raw = `front,back,example
hello,olá,Hi
world,mundo`;

    const result = parseFlashCardsCsv(raw);
    assert.equal(result.rows.length, 2);
    assert.equal(result.rows[0]?.front, 'hello');
    assert.equal(result.rows[1]?.back, 'mundo');
  });

  it('skips invalid lines', () => {
    const result = parseFlashCardsCsv('only-front,\nok,ok');
    assert.equal(result.rows.length, 1);
    assert.equal(result.skipped, 1);
  });
});
