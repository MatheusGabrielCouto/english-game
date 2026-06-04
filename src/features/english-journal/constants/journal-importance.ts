import { theme } from '@/constants';
import { JournalImportance, type JournalImportanceValue } from '@/types/journal';

export type JournalImportanceMeta = {
  label: string;
  shortLabel: string;
  emoji: string;
  hint: string;
  color: string;
  surfaceColor: string;
};

export const JOURNAL_IMPORTANCE_META: Record<JournalImportanceValue, JournalImportanceMeta> = {
  low: {
    label: 'Baixa',
    shortLabel: 'Baixa',
    emoji: '🌿',
    hint: 'Referência — revisar quando der',
    color: theme.colors.common,
    surfaceColor: 'rgba(148, 163, 184, 0.18)',
  },
  medium: {
    label: 'Média',
    shortLabel: 'Média',
    emoji: '📌',
    hint: 'Útil no dia a dia — prioridade normal',
    color: theme.colors.accent,
    surfaceColor: 'rgba(56, 189, 248, 0.18)',
  },
  high: {
    label: 'Alta',
    shortLabel: 'Alta',
    emoji: '⚡',
    hint: 'Importante — vale revisar em breve',
    color: theme.colors.warning,
    surfaceColor: 'rgba(245, 158, 11, 0.2)',
  },
  critical: {
    label: 'Crítica',
    shortLabel: 'Crítica',
    emoji: '🔥',
    hint: 'Urgente — não deixe passar',
    color: theme.colors.danger,
    surfaceColor: 'rgba(239, 68, 68, 0.22)',
  },
};

export const JOURNAL_IMPORTANCE_ORDER: JournalImportanceValue[] = [
  JournalImportance.LOW,
  JournalImportance.MEDIUM,
  JournalImportance.HIGH,
  JournalImportance.CRITICAL,
];
