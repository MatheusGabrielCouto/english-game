import type { VaultSpaceKey } from '@/types/knowledge-vault';

export const VAULT_SPACE_COLORS: Record<VaultSpaceKey, string> = {
  grammar: '#38bdf8',
  vocabulary: '#22c55e',
  speaking: '#a78bfa',
  listening: '#fbbf24',
  reading: '#60a5fa',
  writing: '#c084fc',
  interview_english: '#f472b6',
  programming_english: '#fb923c',
  career_english: '#ef4444',
  teacher_feedback: '#14b8a6',
  english_course: '#818cf8',
  personal_notes: '#94a3b8',
};

export const getSpaceColor = (key: VaultSpaceKey): string => VAULT_SPACE_COLORS[key] ?? '#8b5cf6';
