import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { BACKUP_MESSAGES } from '../constants/backup-tables';
import { BackupService } from '../services/backup-service';

export const useBackupExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportedAt, setLastExportedAt] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const result = await BackupService.exportAndShare();

      if (!result.success) {
        Alert.alert('Backup', result.message);
        return;
      }

      setLastExportedAt(result.file.meta.exportedAt);
      Alert.alert('Backup exportado', BACKUP_MESSAGES.exportSuccess);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    lastExportedAt,
    handleExport,
  };
};
