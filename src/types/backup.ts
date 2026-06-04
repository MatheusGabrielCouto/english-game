export type BackupTableSnapshot = Record<string, Record<string, unknown>[]>;

export type GameBackupMeta = {
  formatVersion: number;
  appId: string;
  appVersion: string;
  exportedAt: string;
  platform: string;
  databaseName: string;
  tableCount: number;
  totalRows: number;
  checksum: string;
  playerName: string | null;
  playerLevel: number | null;
};

export type BackupPreferencesSnapshot = {
  menuHubPinnedIds: string[];
};

export type GameBackupFile = {
  meta: GameBackupMeta;
  tables: BackupTableSnapshot;
  preferences: BackupPreferencesSnapshot;
};

export type BackupExportResult =
  | { success: true; file: GameBackupFile; fileUri: string; fileName: string }
  | { success: false; reason: 'no_player' | 'no_cache_dir' | 'write_failed' | 'share_unavailable' | 'unknown'; message: string };

export type BackupSnapshotSummary = {
  tableCount: number;
  totalRows: number;
  playerName: string | null;
  playerLevel: number | null;
};

export type BackupPreviewSummary = {
  playerName: string | null;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  bestStreak: number;
  petLabel: string | null;
  inventoryItemCount: number;
  achievementCount: number;
  routineCount: number;
  flashDeckCount: number;
  menuFavoritesCount: number;
  exportedAt: string;
  appVersion: string;
  formatVersion: number;
  totalRows: number;
};

export type BackupValidationErrorReason =
  | 'invalid_json'
  | 'invalid_structure'
  | 'invalid_app_id'
  | 'future_format_version'
  | 'unsupported_format_version'
  | 'checksum_mismatch'
  | 'missing_player'
  | 'missing_required_tables'
  | 'incompatible_app_version'
  | 'empty_backup'
  | 'pick_canceled';

export type BackupValidationResult =
  | { valid: true; file: GameBackupFile; preview: BackupPreviewSummary }
  | { valid: false; reason: BackupValidationErrorReason; message: string };

export type BackupRestoreErrorReason =
  | 'not_validated'
  | 'database_error'
  | 'rehydrate_failed'
  | 'unknown';

export type BackupRestoreResult =
  | { success: true; preview: BackupPreviewSummary }
  | { success: false; reason: BackupRestoreErrorReason; message: string };

export type BackupRestoreAnalyticsEventType =
  | 'restore_started'
  | 'restore_completed'
  | 'restore_failed';

export type BackupRestoreAnalyticsEvent = {
  type: BackupRestoreAnalyticsEventType;
  formatVersion?: number;
  appVersion?: string;
  errorReason?: string;
  occurredAt: string;
};
