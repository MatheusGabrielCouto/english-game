import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { computeBackupChecksum } from '../backup-checksum';

describe('computeBackupChecksum', () => {
  it('returns stable hash for same payload', () => {
    const payload = { player: [{ id: 1, name: 'Alex' }], pets: [] };
    assert.equal(computeBackupChecksum(payload), computeBackupChecksum(payload));
  });

  it('changes when table data changes', () => {
    const before = { player: [{ level: 1 }] };
    const after = { player: [{ level: 2 }] };
    assert.notEqual(computeBackupChecksum(before), computeBackupChecksum(after));
  });

  it('is order-independent for object keys', () => {
    const a = { b: 1, a: 2 };
    const b = { a: 2, b: 1 };
    assert.equal(computeBackupChecksum(a), computeBackupChecksum(b));
  });
});
