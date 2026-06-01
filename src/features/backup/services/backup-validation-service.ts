import Constants from 'expo-constants';

import type { BackupValidationResult } from '@/types/backup';

import {
  parseBackupJson,
  validateBackupFile as validateBackupFileCore,
  validateBackupJson as validateBackupJsonCore,
} from './backup-validation-core';

const resolveAppVersion = (): string =>
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

export { parseBackupJson } from './backup-validation-core';

export const validateBackupFile = (raw: unknown): BackupValidationResult =>
  validateBackupFileCore(raw, resolveAppVersion());

export const validateBackupJson = (raw: string): BackupValidationResult =>
  validateBackupJsonCore(raw, resolveAppVersion());
