import Constants from 'expo-constants';

import { StatisticsMilestoneCategory } from '@/types/statistics';
import type { BackupRestoreAnalyticsEvent } from '@/types/backup';

import { StatisticsMilestoneRepository } from '@/storage/repositories/statistics-milestone-repository';

const resolveAppVersion = (): string =>
  Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

const buildMilestoneKey = (type: BackupRestoreAnalyticsEvent['type']): string =>
  `backup_${type}_${Date.now()}`;

const buildLabel = (event: BackupRestoreAnalyticsEvent): string => {
  switch (event.type) {
    case 'restore_started':
      return 'Restauração de backup iniciada';
    case 'restore_completed':
      return `Backup restaurado (v${event.formatVersion ?? '?'})`;
    case 'restore_failed':
      return `Falha na restauração: ${event.errorReason ?? 'desconhecido'}`;
    default:
      return 'Evento de backup';
  }
};

export const BackupAnalyticsService = {
  async record(event: BackupRestoreAnalyticsEvent): Promise<void> {
    if (__DEV__) {
      console.info('[backup-restore]', event);
    }

    try {
      await StatisticsMilestoneRepository.create({
        category: StatisticsMilestoneCategory.SYSTEM,
        milestoneKey: buildMilestoneKey(event.type),
        label: buildLabel(event),
        value: event.formatVersion ?? null,
        metadataJson: JSON.stringify({
          ...event,
          currentAppVersion: resolveAppVersion(),
        }),
        occurredAt: event.occurredAt,
      });
    } catch (error) {
      console.warn('[backup-restore] analytics record failed:', error);
    }
  },

  async recordRestoreStarted(formatVersion: number, appVersion: string): Promise<void> {
    await BackupAnalyticsService.record({
      type: 'restore_started',
      formatVersion,
      appVersion,
      occurredAt: new Date().toISOString(),
    });
  },

  async recordRestoreCompleted(formatVersion: number, appVersion: string): Promise<void> {
    await BackupAnalyticsService.record({
      type: 'restore_completed',
      formatVersion,
      appVersion,
      occurredAt: new Date().toISOString(),
    });
  },

  async recordRestoreFailed(
    errorReason: string,
    formatVersion?: number,
    appVersion?: string,
  ): Promise<void> {
    await BackupAnalyticsService.record({
      type: 'restore_failed',
      formatVersion,
      appVersion,
      errorReason,
      occurredAt: new Date().toISOString(),
    });
  },
};
