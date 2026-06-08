import * as FileSystem from 'expo-file-system/legacy'

const MOTIVATION_AUDIO_DIR = `${FileSystem.documentDirectory ?? ''}motivation-audio/`

export const ensureMotivationAudioDir = async (): Promise<string> => {
  const info = await FileSystem.getInfoAsync(MOTIVATION_AUDIO_DIR)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(MOTIVATION_AUDIO_DIR, { intermediates: true })
  }
  return MOTIVATION_AUDIO_DIR
}

export const buildMotivationAudioPath = (sparkId: string): string =>
  `${MOTIVATION_AUDIO_DIR}${sparkId}.m4a`

export const isPersistedMotivationAudioUri = (uri: string | null | undefined): boolean => {
  if (!uri) return false
  const dir = FileSystem.documentDirectory ?? ''
  return (
    uri.startsWith(MOTIVATION_AUDIO_DIR) ||
    (dir.length > 0 && uri.startsWith(`${dir}motivation-audio/`))
  )
}

export const persistMotivationRecording = async (
  tempUri: string,
  sparkId: string,
): Promise<string> => {
  await ensureMotivationAudioDir()
  const dest = buildMotivationAudioPath(sparkId)
  await FileSystem.copyAsync({ from: tempUri, to: dest })
  return dest
}

export const deleteMotivationAudioFile = async (uri: string | null | undefined): Promise<void> => {
  if (!uri) return
  try {
    const info = await FileSystem.getInfoAsync(uri)
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true })
    }
  } catch {
    // ignore missing files
  }
}
