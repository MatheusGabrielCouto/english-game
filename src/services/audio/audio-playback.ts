import { Platform } from 'react-native'

import { AppLogService } from '@/services/app-log-service'

type ExpoAudioModule = typeof import('expo-audio')
type AudioPlayer = import('expo-audio').AudioPlayer

let expoAudioModule: ExpoAudioModule | null = null
let nativeLoadAttempted = false
let nativeUnavailable = false
let warnedRebuild = false

const warnRebuildOnce = (error: unknown) => {
  if (warnedRebuild) return
  warnedRebuild = true
  AppLogService.warn(
    'audio.native_unavailable',
    'expo-audio requires a dev client rebuild after install (pnpm android or pnpm ios)',
    { message: error instanceof Error ? error.message : String(error) },
  )
}

/** True when expo-audio loaded and the native module is linked in the binary. */
export const isAudioNativeAvailable = (): boolean =>
  Platform.OS !== 'web' && !nativeUnavailable && expoAudioModule !== null

export const ensureAudioNative = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false
  if (nativeUnavailable) return false
  if (expoAudioModule) return true

  if (!nativeLoadAttempted) {
    nativeLoadAttempted = true
    try {
      expoAudioModule = require('expo-audio') as ExpoAudioModule
      return true
    } catch (error) {
      nativeUnavailable = true
      warnRebuildOnce(error)
      return false
    }
  }

  return expoAudioModule !== null
}

export const configureAudioMode = async (): Promise<void> => {
  if (!(await ensureAudioNative()) || !expoAudioModule) return

  try {
    await expoAudioModule.setIsAudioActiveAsync(true)
    await expoAudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
    })
  } catch (error) {
    AppLogService.warn('audio.init_mode_failed', 'Audio mode setup failed', {
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

/** Switches session to recording before prepareToRecordAsync (playback uses allowsRecording: false). */
export const prepareAudioSessionForRecording = async (): Promise<boolean> => {
  if (!(await ensureAudioNative()) || !expoAudioModule) return false

  try {
    await expoAudioModule.setIsAudioActiveAsync(true)
    await expoAudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
      allowsRecording: true,
    })
    return true
  } catch (error) {
    AppLogService.warn('audio.recording_mode_failed', 'Recording audio mode setup failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}

export const playAudioUri = async (
  uri: string,
  onFinished?: () => void,
): Promise<AudioPlayer | null> => {
  if (!(await ensureAudioNative()) || !expoAudioModule) return null

  let player: AudioPlayer | null = null
  let subscription: { remove: () => void } | null = null
  let finished = false

  const finish = () => {
    if (finished) return
    finished = true
    subscription?.remove()
    try {
      player?.remove()
    } catch {
      // already released
    }
    player = null
    onFinished?.()
  }

  const safetyTimeout = setTimeout(finish, 120_000)

  try {
    player = expoAudioModule.createAudioPlayer({ uri })
    subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        clearTimeout(safetyTimeout)
        finish()
      }
    })
    player.play()
    return player
  } catch (error) {
    clearTimeout(safetyTimeout)
    finish()
    AppLogService.warn('audio.play_uri_failed', 'Failed to play journal audio', {
      message: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export const playSoundAsset = async (
  source: number,
  volume: number,
  onFinished: () => void,
): Promise<void> => {
  if (!(await ensureAudioNative()) || !expoAudioModule) return

  let player: AudioPlayer | null = null
  let subscription: { remove: () => void } | null = null
  let didStartPlayback = false
  let finished = false

  const finish = () => {
    if (finished) return
    finished = true
    clearTimeout(safetyTimeout)
    subscription?.remove()
    subscription = null
    try {
      player?.remove()
    } catch {
      // already released
    }
    player = null
    onFinished()
  }

  const safetyTimeout = setTimeout(finish, 8_000)

  const tryPlay = () => {
    if (didStartPlayback || !player || finished) return
    if (!player.isLoaded) return
    didStartPlayback = true
    player.volume = volume
    player.play()
  }

  try {
    player = expoAudioModule.createAudioPlayer(source, {
      downloadFirst: true,
      updateInterval: 100,
    })

    subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (!didStartPlayback && status.isLoaded) {
        tryPlay()
      }
      if (status.didJustFinish) {
        finish()
      }
    })

    tryPlay()
  } catch (error) {
    finish()
    const message = error instanceof Error ? error.message : String(error)
    if (
      message.includes('ExpoAudio') ||
      message.includes('native module') ||
      message.includes('Cannot find')
    ) {
      nativeUnavailable = true
      warnRebuildOnce(error)
      return
    }
    throw error
  }
}
