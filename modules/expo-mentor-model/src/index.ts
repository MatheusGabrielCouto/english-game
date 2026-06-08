import { requireNativeModule } from 'expo-modules-core'
import { Platform } from 'react-native'

type ExpoMentorModelNative = {
  hasBundledModel(fileName: string): boolean
  copyBundledModelIfNeeded(destDir: string, fileName: string): Promise<string>
}

let nativeModule: ExpoMentorModelNative | null = null

if (Platform.OS === 'android') {
  try {
    nativeModule = requireNativeModule<ExpoMentorModelNative>('ExpoMentorModel')
  } catch {
    nativeModule = null
  }
}

export const hasBundledModel = (fileName: string): boolean => {
  if (!nativeModule) return false
  return nativeModule.hasBundledModel(fileName)
}

export const copyBundledModelIfNeeded = async (
  destDir: string,
  fileName: string,
): Promise<string | null> => {
  if (!nativeModule) return null
  return nativeModule.copyBundledModelIfNeeded(destDir, fileName)
}
