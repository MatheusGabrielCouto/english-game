type AndroidAudioSourceProfile = {
  sampleRate: number
  audioChannels: number
  chunkDelayMillis?: number
}

/** Decoded PCM from expo-audio journal preset (16 kHz mono). */
export const JOURNAL_ANDROID_AUDIO_PROFILE: AndroidAudioSourceProfile = {
  sampleRate: 16_000,
  audioChannels: 1,
  chunkDelayMillis: 50,
}

/** Legacy HIGH_QUALITY recordings (44.1 kHz stereo) before journal preset. */
export const LEGACY_HIGH_QUALITY_ANDROID_AUDIO_PROFILE: AndroidAudioSourceProfile = {
  sampleRate: 44_100,
  audioChannels: 2,
  chunkDelayMillis: 80,
}

export const ANDROID_TRANSCRIPTION_AUDIO_PROFILES: AndroidAudioSourceProfile[] = [
  JOURNAL_ANDROID_AUDIO_PROFILE,
  LEGACY_HIGH_QUALITY_ANDROID_AUDIO_PROFILE,
]

const fileExtension = (uri: string): string => {
  const path = uri.split('?')[0]?.toLowerCase() ?? ''
  const dot = path.lastIndexOf('.')
  return dot >= 0 ? path.slice(dot) : ''
}

export const androidTranscriptionProfilesForUri = (uri: string): AndroidAudioSourceProfile[] => {
  const ext = fileExtension(uri)
  if (ext === '.mp3') {
    return [{ sampleRate: 16_000, audioChannels: 1, chunkDelayMillis: 50 }]
  }
  if (ext === '.wav') {
    return [{ sampleRate: 16_000, audioChannels: 1, chunkDelayMillis: 50 }]
  }
  return ANDROID_TRANSCRIPTION_AUDIO_PROFILES
}
