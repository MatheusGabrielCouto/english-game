import { Platform } from 'react-native'

import { AppLogService } from '@/services/app-log-service'
import { GameEvents, type GameEvent } from '@/services/game-events'

import { AUDIO_CATALOG, AUDIO_LIMITS } from './audio-catalog'
import { handleGameEventAudio } from './audio-event-map'
import {
    configureAudioMode,
    ensureAudioNative,
    isAudioNativeAvailable,
    playSoundAsset,
} from './audio-playback'
import { pickFromPool } from './audio-pools'
import { getAudioSettings, useAudioStore } from './audio-store'
import type { AudioAssetKey, AudioPoolId, AudioSettings } from './types'

type PlayOptions = {
  family?: string
  priority?: 'normal' | 'high'
  delayMs?: number
  volumeScale?: number
}

export type AudioDirectorApi = {
  playUI: (poolOrKey: AudioPoolId | AudioAssetKey) => void
  playSFX: (keyOrPool: AudioAssetKey | AudioPoolId, options?: PlayOptions) => Promise<void>
}

let initialized = false
let unsubscribeGameEvents: (() => void) | null = null
const familyLastPlayedAt = new Map<string, number>()
let activeSfxCount = 0

const resolveAssetKey = (keyOrPool: AudioAssetKey | AudioPoolId): AudioAssetKey => {
  if (keyOrPool in AUDIO_CATALOG) {
    return keyOrPool as AudioAssetKey
  }
  return pickFromPool(keyOrPool as AudioPoolId)
}

const getEffectiveVolume = (settings: AudioSettings, scale = 1): number => {
  if (!settings.enabled) return 0
  return settings.masterVolume * settings.sfxVolume * scale
}

const canPlayFamily = (family: string | undefined): boolean => {
  if (!family) return true
  const last = familyLastPlayedAt.get(family) ?? 0
  if (Date.now() - last < AUDIO_LIMITS.familyCooldownMs) return false
  familyLastPlayedAt.set(family, Date.now())
  return true
}

const playAsset = async (assetKey: AudioAssetKey, options: PlayOptions = {}): Promise<void> => {
  if (Platform.OS === 'web') return

  const settings = getAudioSettings()
  if (!settings.enabled) return
  if (settings.studySilentMode && options.priority !== 'high') return
  if (!canPlayFamily(options.family)) return
  if (activeSfxCount >= AUDIO_LIMITS.maxSimultaneousSfx && options.priority !== 'high') return

  const source = AUDIO_CATALOG[assetKey]
  if (!source) return

  const volume = getEffectiveVolume(settings, options.volumeScale ?? 1)
  if (volume <= 0) return

  const run = async () => {
    if (!(await ensureAudioNative())) return

    activeSfxCount += 1
    try {
      await playSoundAsset(source, volume, () => {
        activeSfxCount = Math.max(0, activeSfxCount - 1)
      })
    } catch (error) {
      activeSfxCount = Math.max(0, activeSfxCount - 1)
      AppLogService.warn('audio.play_failed', `Failed to play ${assetKey}`, {
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (options.delayMs && options.delayMs > 0) {
    setTimeout(() => {
      void run()
    }, options.delayMs)
    return
  }

  await run()
}

export const AudioDirector: AudioDirectorApi & {
  init: () => Promise<void>
  dispose: () => Promise<void>
  onGameEvent: (event: GameEvent) => void
  applySettings: (settings: AudioSettings) => void
  isNativeAvailable: () => boolean
} = {
  async init() {
    if (initialized) return

    await useAudioStore.getState().hydrate()

    if (Platform.OS !== 'web') {
      await configureAudioMode()

      unsubscribeGameEvents = GameEvents.subscribe((event) => {
        AudioDirector.onGameEvent(event)
      })
    }

    initialized = true
  },

  async dispose() {
    unsubscribeGameEvents?.()
    unsubscribeGameEvents = null
    initialized = false
  },

  applySettings(_settings: AudioSettings) {
    // Volume applied per-play from store
  },

  isNativeAvailable() {
    return isAudioNativeAvailable()
  },

  onGameEvent(event: GameEvent) {
    if (Platform.OS === 'web') return
    void (async () => {
      if (!(await ensureAudioNative())) return
      handleGameEventAudio(AudioDirector, event)
    })()
  },

  playUI(keyOrPool) {
    if (Platform.OS === 'web') return
    const settings = getAudioSettings()
    if (!settings.enabled || settings.studySilentMode) return

    const assetKey = resolveAssetKey(keyOrPool)
    void playAsset(assetKey, { family: 'ui', volumeScale: 0.7 })
  },

  playSFX(keyOrPool, options) {
    if (Platform.OS === 'web') return Promise.resolve()
    const assetKey = resolveAssetKey(keyOrPool)
    return playAsset(assetKey, options)
  },
}
