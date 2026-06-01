import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BACKUP_APP_ID, BACKUP_FORMAT_VERSION } from '../../constants/backup-tables';
import { validateBackupFile } from '../../services/backup-validation-core';
import { computeBackupChecksum } from '../backup-checksum';
import { buildBackupPreview } from '../backup-preview';

const buildMinimalBackup = () => {
  const tables = {
    player: [
      {
        id: 1,
        name: 'Tester',
        level: 10,
        xp: 500,
        coins: 200,
        current_streak: 5,
        best_streak: 12,
        shields: 2,
      },
    ],
    app_settings: [{ id: 1, has_onboarded: 1 }],
    daily_missions: [],
    weekly_missions: [],
    epic_mission_progress: [],
    player_statistics: [{ id: 1, total_study_minutes: 100 }],
    inventory_loot_boxes: [{ id: 1, rarity: 'common' }],
    inventory_special_items: [],
    inventory_analytics: [{ id: 1, total_items_acquired: 1 }],
    pets: [{ id: 1, name: 'Buddy', stage: 'egg' }],
    achievement_unlocks: [{ id: 1, achievement_key: 'first_day' }],
  };

  const checksum = computeBackupChecksum(tables);

  return {
    meta: {
      formatVersion: BACKUP_FORMAT_VERSION,
      appId: BACKUP_APP_ID,
      appVersion: '1.0.0',
      exportedAt: '2026-05-31T12:00:00.000Z',
      platform: 'ios',
      databaseName: 'english-quest.db',
      tableCount: 49,
      totalRows: 8,
      checksum,
      playerName: 'Tester',
      playerLevel: 10,
    },
    tables,
  };
};

describe('backup validation', () => {
  it('accepts a valid backup with checksum', () => {
    const backup = buildMinimalBackup();
    const result = validateBackupFile(backup);

    assert.equal(result.valid, true);
    if (result.valid) {
      assert.equal(result.preview.playerName, 'Tester');
      assert.equal(result.preview.level, 10);
    }
  });

  it('rejects backup with wrong app id', () => {
    const backup = buildMinimalBackup();
    backup.meta.appId = 'other-app';

    const result = validateBackupFile(backup);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.equal(result.reason, 'incompatible_app_version');
    }
  });

  it('rejects backup with checksum mismatch', () => {
    const backup = buildMinimalBackup();
    backup.meta.checksum = '00000000';

    const result = validateBackupFile(backup);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.equal(result.reason, 'checksum_mismatch');
    }
  });

  it('rejects future format version', () => {
    const backup = buildMinimalBackup();
    backup.meta.formatVersion = BACKUP_FORMAT_VERSION + 1;

    const result = validateBackupFile(backup);
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.equal(result.reason, 'future_format_version');
    }
  });
});

describe('backup preview', () => {
  it('builds preview summary from tables', () => {
    const backup = buildMinimalBackup();
    const preview = buildBackupPreview(backup as never);

    assert.equal(preview.playerName, 'Tester');
    assert.equal(preview.level, 10);
    assert.equal(preview.coins, 200);
    assert.equal(preview.streak, 5);
    assert.equal(preview.petLabel, 'Buddy');
    assert.equal(preview.achievementCount, 1);
  });
});
