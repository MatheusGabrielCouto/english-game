import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    BACKUP_APP_ID,
    BACKUP_FORMAT_VERSION,
    BACKUP_TABLE_NAMES,
} from '../../constants/backup-tables'
import { validateBackupFile } from '../../services/backup-validation-core'
import { computeBackupFileChecksum } from '../backup-payload'
import { buildBackupPreview } from '../backup-preview'

const buildMinimalBackup = () => {
  const tables = Object.fromEntries(
    BACKUP_TABLE_NAMES.map((tableName) => [tableName, [] as Record<string, unknown>[]]),
  ) as Record<string, Record<string, unknown>[]>

  tables.player = [
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
  ]
  tables.app_settings = [{ id: 1, has_onboarded: 1 }]
  tables.daily_missions = []
  tables.weekly_missions = []
  tables.epic_mission_progress = []
  tables.player_statistics = [{ id: 1, total_study_minutes: 100 }]
  tables.inventory_loot_boxes = [{ id: 1, rarity: 'common' }]
  tables.inventory_special_items = []
  tables.inventory_analytics = [{ id: 1, total_items_acquired: 1 }]
  tables.pets = [{ id: 1, name: 'Buddy', stage: 'egg' }]
  tables.achievement_unlocks = [{ id: 1, achievement_key: 'first_day' }]
  tables.user_routines = [{ id: 'r1', title: 'Study' }]
  tables.flash_decks = [{ id: 'd1', name: 'Core' }]

  const preferences = { menuHubPinnedIds: ['city', 'pet'] }
  const checksum = computeBackupFileChecksum(tables, preferences)
  const totalRows =
    BACKUP_TABLE_NAMES.reduce((sum, tableName) => sum + tables[tableName].length, 0) +
    preferences.menuHubPinnedIds.length

  return {
    meta: {
      formatVersion: BACKUP_FORMAT_VERSION,
      appId: BACKUP_APP_ID,
      appVersion: '1.0.0',
      exportedAt: '2026-05-31T12:00:00.000Z',
      platform: 'ios',
      databaseName: 'english-quest.db',
      tableCount: BACKUP_TABLE_NAMES.length,
      totalRows,
      checksum,
      playerName: 'Tester',
      playerLevel: 10,
    },
    tables,
    preferences,
  }
}

describe('backup validation', () => {
  it('accepts a valid backup with checksum', () => {
    const backup = buildMinimalBackup()
    const result = validateBackupFile(backup)

    assert.equal(result.valid, true)
    if (result.valid) {
      assert.equal(result.preview.playerName, 'Tester')
      assert.equal(result.preview.level, 10)
      assert.equal(result.preview.menuFavoritesCount, 2)
    }
  })

  it('rejects backup with wrong app id', () => {
    const backup = buildMinimalBackup()
    backup.meta.appId = 'other-app'

    const result = validateBackupFile(backup)
    assert.equal(result.valid, false)
    if (!result.valid) {
      assert.equal(result.reason, 'incompatible_app_version')
    }
  })

  it('rejects backup with checksum mismatch', () => {
    const backup = buildMinimalBackup()
    backup.meta.checksum = '00000000'

    const result = validateBackupFile(backup)
    assert.equal(result.valid, false)
    if (!result.valid) {
      assert.equal(result.reason, 'checksum_mismatch')
    }
  })

  it('rejects future format version', () => {
    const backup = buildMinimalBackup()
    backup.meta.formatVersion = BACKUP_FORMAT_VERSION + 1

    const result = validateBackupFile(backup)
    assert.equal(result.valid, false)
    if (!result.valid) {
      assert.equal(result.reason, 'future_format_version')
    }
  })

  it('migrates v1 backups without preferences', () => {
    const backup = buildMinimalBackup()
    backup.meta.formatVersion = 1
    delete (backup as { preferences?: unknown }).preferences

    const result = validateBackupFile(backup)
    assert.equal(result.valid, true)
    if (result.valid) {
      assert.equal(result.file.meta.formatVersion, BACKUP_FORMAT_VERSION)
      assert.deepEqual(result.file.preferences.menuHubPinnedIds, [])
    }
  })
})

describe('backup preview', () => {
  it('builds preview summary from tables', () => {
    const backup = buildMinimalBackup()
    const preview = buildBackupPreview(backup as never)

    assert.equal(preview.playerName, 'Tester')
    assert.equal(preview.level, 10)
    assert.equal(preview.coins, 200)
    assert.equal(preview.streak, 5)
    assert.equal(preview.petLabel, 'Buddy')
    assert.equal(preview.achievementCount, 1)
    assert.equal(preview.routineCount, 1)
    assert.equal(preview.flashDeckCount, 1)
    assert.equal(preview.menuFavoritesCount, 2)
  })
})
