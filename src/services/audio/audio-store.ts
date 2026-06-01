import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'

import { DEFAULT_AUDIO_SETTINGS, type AudioSettings } from './types'

const STORAGE_KEY = 'english-quest-audio-settings'

type AudioStoreState = AudioSettings & {
  _hydrated: boolean
  hydrate: () => Promise<void>
  patch: (partial: Partial<AudioSettings>) => Promise<void>
}

const persist = async (settings: AudioSettings) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  ...DEFAULT_AUDIO_SETTINGS,
  _hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AudioSettings>
        set({
          enabled: parsed.enabled ?? DEFAULT_AUDIO_SETTINGS.enabled,
          masterVolume: clamp01(parsed.masterVolume ?? DEFAULT_AUDIO_SETTINGS.masterVolume),
          sfxVolume: clamp01(parsed.sfxVolume ?? DEFAULT_AUDIO_SETTINGS.sfxVolume),
          studySilentMode: parsed.studySilentMode ?? DEFAULT_AUDIO_SETTINGS.studySilentMode,
          _hydrated: true,
        })
        return
      }
    } catch {
      // use defaults
    }
    set({ _hydrated: true })
  },

  patch: async (partial) => {
    const next: AudioSettings = {
      enabled: partial.enabled ?? get().enabled,
      masterVolume: clamp01(partial.masterVolume ?? get().masterVolume),
      sfxVolume: clamp01(partial.sfxVolume ?? get().sfxVolume),
      studySilentMode: partial.studySilentMode ?? get().studySilentMode,
    }
    set({ ...next, _hydrated: true })
    await persist(next)
  },
}))

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const getAudioSettings = (): AudioSettings => {
  const state = useAudioStore.getState()
  return {
    enabled: state.enabled,
    masterVolume: state.masterVolume,
    sfxVolume: state.sfxVolume,
    studySilentMode: state.studySilentMode,
  }
}
