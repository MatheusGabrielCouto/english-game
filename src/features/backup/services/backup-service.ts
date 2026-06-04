import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import type { BackupExportResult, GameBackupFile } from '@/types/backup';

import { BACKUP_MESSAGES, BACKUP_MIME_TYPE } from '../constants/backup-tables';
import {
    buildGameBackupFile,
    createBackupFileName,
    serializeBackupFile,
} from './backup-export-service';

const resolveAppVersion = (): string =>
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

export const BackupService = {
  async createSnapshot(): Promise<GameBackupFile> {
    const file = await buildGameBackupFile({
      appVersion: resolveAppVersion(),
      platform: Platform.OS,
    });

    if (!file.tables.player.length) {
      throw new Error(BACKUP_MESSAGES.emptyPlayer);
    }

    return file;
  },

  async exportAndShare(): Promise<BackupExportResult> {
    try {
      const file = await BackupService.createSnapshot();

      if (!FileSystem.cacheDirectory) {
        return {
          success: false,
          reason: 'no_cache_dir',
          message: BACKUP_MESSAGES.exportFailed,
        };
      }

      const fileName = createBackupFileName(file.meta.exportedAt);
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      const contents = serializeBackupFile(file);

      await FileSystem.writeAsStringAsync(fileUri, contents, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return {
          success: false,
          reason: 'share_unavailable',
          message: BACKUP_MESSAGES.exportUnavailable,
        };
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: BACKUP_MIME_TYPE,
        dialogTitle: 'Salvar backup — English Quest',
        UTI: 'public.json',
      });

      return { success: true, file, fileUri, fileName };
    } catch (error) {
      const message = error instanceof Error ? error.message : BACKUP_MESSAGES.exportFailed;

      if (message === BACKUP_MESSAGES.emptyPlayer) {
        return { success: false, reason: 'no_player', message };
      }

      return { success: false, reason: 'unknown', message: BACKUP_MESSAGES.exportFailed };
    }
  },
};
