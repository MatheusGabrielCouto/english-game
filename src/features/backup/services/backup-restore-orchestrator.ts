import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { initDatabase } from '@/storage/database/client';
import { refreshApplicationAfterRestore } from '@/storage/hydrate-stores';
import type { BackupRestoreResult, BackupValidationResult, GameBackupFile } from '@/types/backup';

import { BACKUP_MESSAGES, BACKUP_MIME_TYPE } from '../constants/backup-tables';
import { buildBackupPreview } from '../utils/backup-preview';
import { BackupAnalyticsService } from './backup-analytics-service';
import { restoreBackupTables } from './backup-restore-service';
import { validateBackupJson } from './backup-validation-service';

let validatedFile: GameBackupFile | null = null;

export const BackupRestoreService = {
  getValidatedFile(): GameBackupFile | null {
    return validatedFile;
  },

  clearValidatedFile(): void {
    validatedFile = null;
  },

  async pickAndValidateBackup(): Promise<BackupValidationResult> {
    const result = await DocumentPicker.getDocumentAsync({
      type: [BACKUP_MIME_TYPE, 'application/octet-stream', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        valid: false,
        reason: 'pick_canceled',
        message: BACKUP_MESSAGES.importPickCanceled,
      };
    }

    const asset = result.assets[0];
    const fileName = asset.name?.toLowerCase() ?? '';

    if (fileName && !fileName.endsWith('.json')) {
      return {
        valid: false,
        reason: 'invalid_structure',
        message: BACKUP_MESSAGES.importInvalidFile,
      };
    }

    try {
      const raw = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const validation = validateBackupJson(raw);

      if (validation.valid) {
        validatedFile = validation.file;
      } else {
        validatedFile = null;
      }

      return validation;
    } catch {
      validatedFile = null;
      return {
        valid: false,
        reason: 'invalid_json',
        message: BACKUP_MESSAGES.importReadFailed,
      };
    }
  },

  async restoreValidatedBackup(): Promise<BackupRestoreResult> {
    if (!validatedFile) {
      return {
        success: false,
        reason: 'not_validated',
        message: BACKUP_MESSAGES.importInvalidFile,
      };
    }

    const file = validatedFile;
    const preview = buildBackupPreview(file);

    await BackupAnalyticsService.recordRestoreStarted(
      file.meta.formatVersion,
      file.meta.appVersion,
    );

    try {
      await initDatabase();
      restoreBackupTables(file);
      await refreshApplicationAfterRestore();

      await BackupAnalyticsService.recordRestoreCompleted(
        file.meta.formatVersion,
        file.meta.appVersion,
      );

      validatedFile = null;

      return {
        success: true,
        preview,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : BACKUP_MESSAGES.restoreFailed;

      await BackupAnalyticsService.recordRestoreFailed(
        message,
        file.meta.formatVersion,
        file.meta.appVersion,
      );

      return {
        success: false,
        reason: 'database_error',
        message: BACKUP_MESSAGES.restoreFailed,
      };
    }
  },
};
