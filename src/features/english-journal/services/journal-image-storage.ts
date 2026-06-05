import * as FileSystem from 'expo-file-system/legacy';

const JOURNAL_IMAGES_DIR = `${FileSystem.documentDirectory ?? ''}journal-images/`;

export const JOURNAL_MAX_IMAGES_PER_ENTRY = 5;

const imageExtensionFromUri = (uri: string): string => {
  const match = uri.match(/\.(jpe?g|png|webp|heic)$/i);
  if (!match) return 'jpg';
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
};

export const ensureJournalImagesDir = async (entryId: string): Promise<string> => {
  const dir = `${JOURNAL_IMAGES_DIR}${entryId}/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
};

export const buildJournalImagePath = (entryId: string, index: number, sourceUri: string): string =>
  `${JOURNAL_IMAGES_DIR}${entryId}/${index}.${imageExtensionFromUri(sourceUri)}`;

export const isPersistedJournalImageUri = (uri: string | null | undefined): boolean => {
  if (!uri) return false;
  const dir = FileSystem.documentDirectory ?? '';
  return uri.startsWith(JOURNAL_IMAGES_DIR) || (dir.length > 0 && uri.startsWith(`${dir}journal-images/`));
};

export const persistJournalImage = async (
  tempUri: string,
  entryId: string,
  index: number,
): Promise<string> => {
  await ensureJournalImagesDir(entryId);
  const dest = buildJournalImagePath(entryId, index, tempUri);
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
};

export const reconcileJournalImages = async (
  existingUris: string[],
  desiredUris: string[],
  entryId: string,
): Promise<string[]> => {
  const capped = desiredUris.slice(0, JOURNAL_MAX_IMAGES_PER_ENTRY);
  const persisted: string[] = [];

  for (let i = 0; i < capped.length; i++) {
    const uri = capped[i];
    if (isPersistedJournalImageUri(uri)) {
      persisted.push(uri);
    } else {
      persisted.push(await persistJournalImage(uri, entryId, i));
    }
  }

  for (const oldUri of existingUris) {
    if (!persisted.includes(oldUri)) {
      await deleteJournalImageFile(oldUri);
    }
  }

  return persisted;
};

export const deleteJournalImageFile = async (uri: string | null | undefined): Promise<void> => {
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

export const deleteJournalImagesForEntry = async (
  entryId: string,
  imageUris: string[],
): Promise<void> => {
  for (const uri of imageUris) {
    await deleteJournalImageFile(uri);
  }

  const dir = `${JOURNAL_IMAGES_DIR}${entryId}/`;
  try {
    const info = await FileSystem.getInfoAsync(dir);
    if (info.exists) {
      await FileSystem.deleteAsync(dir, { idempotent: true });
    }
  } catch {
    // ignore missing directory
  }
};
