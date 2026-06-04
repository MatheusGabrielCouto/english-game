import * as FileSystem from 'expo-file-system/legacy';

const JOURNAL_AUDIO_DIR = `${FileSystem.documentDirectory ?? ''}journal-audio/`;

export const ensureJournalAudioDir = async (): Promise<string> => {
  const info = await FileSystem.getInfoAsync(JOURNAL_AUDIO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(JOURNAL_AUDIO_DIR, { intermediates: true });
  }
  return JOURNAL_AUDIO_DIR;
};

export const buildJournalAudioPath = (entryId: string): string =>
  `${JOURNAL_AUDIO_DIR}${entryId}.m4a`;

export const isPersistedJournalAudioUri = (uri: string | null | undefined): boolean => {
  if (!uri) return false;
  const dir = FileSystem.documentDirectory ?? '';
  return uri.startsWith(JOURNAL_AUDIO_DIR) || (dir.length > 0 && uri.startsWith(`${dir}journal-audio/`));
};

export const persistJournalRecording = async (
  tempUri: string,
  entryId: string,
): Promise<string> => {
  await ensureJournalAudioDir();
  const dest = buildJournalAudioPath(entryId);
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
};

export const deleteJournalAudioFile = async (uri: string | null | undefined): Promise<void> => {
  if (!uri) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // ignore missing files
  }
};
