import { Text, View } from 'react-native';

import { Button, Card } from '@/components';

import { BACKUP_EXPORT_SUMMARY, BACKUP_TABLE_NAMES } from '../constants/backup-tables';
import { useBackupExport } from '../hooks/use-backup-export';
import { useBackupRestore } from '../hooks/use-backup-restore';
import { BackupPreviewCard } from './BackupPreviewCard';

export const BackupRestoreSection = () => {
  const { isExporting, lastExportedAt, handleExport } = useBackupExport();
  const {
    isImporting,
    isRestoring,
    preview,
    handleImport,
    handleRestore,
    handleClearPreview,
  } = useBackupRestore();

  return (
    <View className="gap-3">
      <Card elevated>
        <View className="gap-3">
          <View>
            <Text className=" font-semibold text-foreground">Exportar backup</Text>
            <Text className="mt-1 text-sm leading-5 text-foreground-secondary">
              Salve uma cópia completa em JSON — Arquivos, iCloud, Google Drive ou compartilhamento.
            </Text>
          </View>

          <View className="rounded-xl border border-border bg-surface px-3 py-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-muted">Inclui</Text>
            <Text className="mt-1 text-sm text-foreground-secondary">
              {BACKUP_TABLE_NAMES.length} tabelas — {BACKUP_EXPORT_SUMMARY}
            </Text>
            {lastExportedAt ? (
              <Text className="mt-2 text-xs text-accent">
                Último backup: {new Date(lastExportedAt).toLocaleString('pt-BR')}
              </Text>
            ) : null}
          </View>

          <Button
            label={isExporting ? 'Exportando…' : 'Exportar backup'}
            onPress={handleExport}
            disabled={isExporting}
            variant="secondary"
            accessibilityLabel="Exportar backup do progresso"
          />
        </View>
      </Card>

      <Card elevated accent>
        <View className="gap-3">
          <View>
            <Text className=" font-semibold text-foreground">Importar backup</Text>
            <Text className="mt-1 text-sm leading-5 text-foreground-secondary">
              Restaure seu progresso a partir de um arquivo .json exportado anteriormente.
            </Text>
          </View>

          {!preview ? (
            <Button
              label={isImporting ? 'Lendo arquivo…' : 'Selecionar arquivo'}
              onPress={handleImport}
              disabled={isImporting || isRestoring}
              accessibilityLabel="Importar arquivo de backup"
            />
          ) : (
            <>
              <BackupPreviewCard preview={preview} />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button
                    label="Trocar arquivo"
                    variant="secondary"
                    onPress={handleClearPreview}
                    disabled={isRestoring}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    label={isRestoring ? 'Restaurando…' : 'Restaurar'}
                    onPress={handleRestore}
                    disabled={isRestoring}
                    accessibilityLabel="Confirmar restauração do backup"
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </Card>
    </View>
  );
};

/** @deprecated Use BackupRestoreSection */
export const BackupSection = BackupRestoreSection;
