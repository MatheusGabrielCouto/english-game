import { isPersistedJournalAudioUri } from '../services/journal-audio-storage';
import { JournalEntryType, type JournalEntryTypeValue } from '@/types/journal';

export const validateJournalTitle = (title: string): { valid: boolean; error?: string } => {
  const trimmed = title.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: 'Título deve ter pelo menos 2 caracteres' };
  }
  if (trimmed.length > 120) {
    return { valid: false, error: 'Título muito longo (máx. 120)' };
  }
  return { valid: true };
};

export const validateJournalBody = (
  body: string,
  entryType: JournalEntryTypeValue,
): { valid: boolean; error?: string } => {
  const trimmed = body.trim();
  const requiresBody =
    entryType !== JournalEntryType.VOICE_NOTE && entryType !== JournalEntryType.QUICK_NOTE;

  if (requiresBody && trimmed.length < 1) {
    return { valid: false, error: 'Escreva o conteúdo da nota' };
  }
  if (trimmed.length > 8000) {
    return { valid: false, error: 'Conteúdo muito longo (máx. 8000)' };
  }
  return { valid: true };
};

export const entryTypeRequiresAudio = (entryType: JournalEntryTypeValue): boolean =>
  entryType === JournalEntryType.VOICE_NOTE;

export type JournalAudioUpdatePayload = {
  audioTempUri?: string;
  removeAudio?: boolean;
  audioDurationMs?: number | null;
};

export const resolveAudioUpdatePayload = (
  audioUri: string | null,
  audioDurationMs: number,
  persistedUri: string | null | undefined,
): JournalAudioUpdatePayload => {
  const duration = audioDurationMs > 0 ? audioDurationMs : null;

  if (!audioUri) {
    if (persistedUri) return { removeAudio: true, audioDurationMs: null };
    return { audioDurationMs: duration };
  }

  if (persistedUri && audioUri === persistedUri) {
    return { audioDurationMs: duration };
  }

  if (!persistedUri || !isPersistedJournalAudioUri(audioUri) || audioUri !== persistedUri) {
    return { audioTempUri: audioUri, audioDurationMs: duration };
  }

  return { audioDurationMs: duration };
};
