import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import type { BackupPreviewSummary } from '@/types/backup';

import { BACKUP_MESSAGES } from '../constants/backup-tables';
import { BackupRestoreService } from '../services/backup-restore-orchestrator';

export const useBackupRestore = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [preview, setPreview] = useState<BackupPreviewSummary | null>(null);

  const handleImport = useCallback(async () => {
    setIsImporting(true);

    try {
      const result = await BackupRestoreService.pickAndValidateBackup();

      if (!result.valid) {
        if (result.reason === 'pick_canceled') return;

        Alert.alert('Backup inválido', result.message);
        setPreview(null);
        BackupRestoreService.clearValidatedFile();
        return;
      }

      setPreview(result.preview);
    } finally {
      setIsImporting(false);
    }
  }, []);

  const handleClearPreview = useCallback(() => {
    setPreview(null);
    BackupRestoreService.clearValidatedFile();
  }, []);

  const executeRestore = useCallback(async () => {
    setIsRestoring(true);

    try {
      const result = await BackupRestoreService.restoreValidatedBackup();

      if (!result.success) {
        Alert.alert('Restauração falhou', result.message);
        return;
      }

      setPreview(null);
      Alert.alert('Restauração concluída', BACKUP_MESSAGES.restoreSuccess);
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const handleRestore = useCallback(() => {
    if (!preview) return;

    Alert.alert(
      BACKUP_MESSAGES.restoreConfirmTitle,
      BACKUP_MESSAGES.restoreConfirmMessage,
      [
        { text: BACKUP_MESSAGES.restoreCancelAction, style: 'cancel' },
        {
          text: BACKUP_MESSAGES.restoreConfirmAction,
          style: 'destructive',
          onPress: () => {
            void executeRestore();
          },
        },
      ],
    );
  }, [executeRestore, preview]);

  return {
    isImporting,
    isRestoring,
    preview,
    handleImport,
    handleRestore,
    handleClearPreview,
  };
};
