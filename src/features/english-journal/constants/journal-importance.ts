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
    hint: 'Só consulta quando precisar — sem pressa de revisar.',
    color: theme.colors.common,
    surfaceColor: 'rgba(148, 163, 184, 0.18)',
  },
  medium: {
    label: 'Média',
    shortLabel: 'Média',
    emoji: '📌',
    hint: 'Prioridade padrão — entra na rotina de revisão do app.',
    color: theme.colors.accent,
    surfaceColor: 'rgba(56, 189, 248, 0.18)',
  },
  high: {
    label: 'Alta',
    shortLabel: 'Alta',
    emoji: '⚡',
    hint: 'Vale revisar em breve — conteúdo que você não quer esquecer.',
    color: theme.colors.warning,
    surfaceColor: 'rgba(245, 158, 11, 0.2)',
  },
  critical: {
    label: 'Crítica',
    shortLabel: 'Crítica',
    emoji: '🔥',
    hint: 'Urgente — aparece entre as mais importantes da biblioteca.',
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
