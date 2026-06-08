import * as FileSystem from 'expo-file-system/legacy'

import { MOTIVATION_MAX_IMAGES_PER_SPARK } from '../constants/motivation-limits'

const MOTIVATION_IMAGES_DIR = `${FileSystem.documentDirectory ?? ''}motivation-images/`

export { MOTIVATION_MAX_IMAGES_PER_SPARK }

const imageExtensionFromUri = (uri: string): string => {
  const match = uri.match(/\.(jpe?g|png|webp|heic)$/i)
  if (!match) return 'jpg'
  const ext = match[1].toLowerCase()
  return ext === 'jpeg' ? 'jpg' : ext
}

export const ensureMotivationImagesDir = async (sparkId: string): Promise<string> => {
  const dir = `${MOTIVATION_IMAGES_DIR}${sparkId}/`
  const info = await FileSystem.getInfoAsync(dir)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
  }
  return dir
}

export const buildMotivationImagePath = (
  sparkId: string,
  index: number,
  sourceUri: string,
): string => `${MOTIVATION_IMAGES_DIR}${sparkId}/${index}.${imageExtensionFromUri(sourceUri)}`

export const isPersistedMotivationImageUri = (uri: string | null | undefined): boolean => {
  if (!uri) return false
  const dir = FileSystem.documentDirectory ?? ''
  return (
    uri.startsWith(MOTIVATION_IMAGES_DIR) ||
    (dir.length > 0 && uri.startsWith(`${dir}motivation-images/`))
  )
}

export const persistMotivationImage = async (
  tempUri: string,
  sparkId: string,
  index: number,
): Promise<string> => {
  await ensureMotivationImagesDir(sparkId)
  const dest = buildMotivationImagePath(sparkId, index, tempUri)
  await FileSystem.copyAsync({ from: tempUri, to: dest })
  return dest
}

export const reconcileMotivationImages = async (
  existingUris: string[],
  desiredUris: string[],
  sparkId: string,
): Promise<string[]> => {
  const capped = desiredUris.slice(0, MOTIVATION_MAX_IMAGES_PER_SPARK)
  const persisted: string[] = []

  for (let i = 0; i < capped.length; i++) {
    const uri = capped[i]
    if (isPersistedMotivationImageUri(uri)) {
      persisted.push(uri)
    } else {
      persisted.push(await persistMotivationImage(uri, sparkId, i))
    }
  }

  for (const oldUri of existingUris) {
    if (!persisted.includes(oldUri)) {
      await deleteMotivationImageFile(oldUri)
    }
  }

  return persisted
}

export const deleteMotivationImageFile = async (uri: string | null | undefined): Promise<void> => {
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

export const deleteMotivationImagesForSpark = async (
  sparkId: string,
  imageUris: string[],
): Promise<void> => {
  for (const uri of imageUris) {
    await deleteMotivationImageFile(uri)
  }

  const dir = `${MOTIVATION_IMAGES_DIR}${sparkId}/`
  try {
    const info = await FileSystem.getInfoAsync(dir)
    if (info.exists) {
      await FileSystem.deleteAsync(dir, { idempotent: true })
    }
  } catch {
    // ignore missing directory
  }
}
