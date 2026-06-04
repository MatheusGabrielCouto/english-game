import { Platform } from 'react-native'

import { JOURNAL_UI } from '../constants/journal-ui'
import {
    androidTranscriptionProfilesForUri,
    type AndroidAudioSourceProfile,
} from '../utils/journal-android-audio-source'

export type JournalSpeechLocale = 'en-US' | 'pt-BR'

export type JournalTranscriptionResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'unavailable' | 'permission_denied' | 'empty' | 'failed'; message: string }

type SpeechModule = typeof import('expo-speech-recognition')

const TRANSCRIPTION_TIMEOUT_MS = 120_000

const NO_SPEECH_ERROR_CODES = new Set(['no-speech', 'speech-timeout'])

const loadSpeechModule = (): SpeechModule | null => {
  try {
    return require('expo-speech-recognition') as SpeechModule
  } catch {
    return null
  }
}

const ensureFileUri = (uri: string): string => (uri.startsWith('file://') ? uri : `file://${uri}`)

const joinTranscriptSegments = (segments: string[]): string =>
  segments
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

const mapTranscriptionErrorMessage = (error: string, message: string): string => {
  if (NO_SPEECH_ERROR_CODES.has(error)) {
    return JOURNAL_UI.transcriptionEmpty
  }
  if (error === 'language-not-supported' || error === 'language-unavailable') {
    return JOURNAL_UI.transcriptionLanguageUnavailable
  }
  return message || JOURNAL_UI.transcriptionFailed
}

const shouldRetryTranscription = (result: JournalTranscriptionResult): boolean => {
  if (result.ok) return false
  return result.reason === 'empty'
}

type TranscribeOnceOptions = {
  speech: SpeechModule
  uri: string
  speechLocale: JournalSpeechLocale
  androidProfile?: AndroidAudioSourceProfile
}

const transcribeJournalAudioOnce = async ({
  speech,
  uri,
  speechLocale,
  androidProfile,
}: TranscribeOnceOptions): Promise<JournalTranscriptionResult> => {
  const { AudioEncodingAndroid, ExpoSpeechRecognitionModule } = speech

  return new Promise((resolve) => {
    const finalSegments: string[] = []
    let latestInterim = ''
    let settled = false

    const subscriptions: { remove: () => void }[] = []

    const cleanup = () => {
      clearTimeout(timeoutId)
      subscriptions.forEach((subscription) => subscription.remove())
    }

    const finish = (result: JournalTranscriptionResult) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(result)
    }

    const timeoutId = setTimeout(() => {
      try {
        ExpoSpeechRecognitionModule.abort()
      } catch {
        // ignore
      }
      finish({ ok: false, reason: 'failed', message: JOURNAL_UI.transcriptionFailed })
    }, TRANSCRIPTION_TIMEOUT_MS)

    subscriptions.push(
      ExpoSpeechRecognitionModule.addListener('result', (event) => {
        const transcript = event.results?.[0]?.transcript?.trim()
        if (!transcript) return

        if (event.isFinal) {
          finalSegments.push(transcript)
          latestInterim = ''
          return
        }

        latestInterim = transcript
      }),
      ExpoSpeechRecognitionModule.addListener('end', () => {
        const text = joinTranscriptSegments(
          finalSegments.length > 0 ? finalSegments : latestInterim ? [latestInterim] : [],
        )

        if (!text) {
          finish({ ok: false, reason: 'empty', message: JOURNAL_UI.transcriptionEmpty })
          return
        }

        finish({ ok: true, text })
      }),
      ExpoSpeechRecognitionModule.addListener('error', (event) => {
        if (event.error === 'aborted') return

        const message = mapTranscriptionErrorMessage(event.error, event.message)
        const reason =
          event.error === 'not-allowed'
            ? 'permission_denied'
            : NO_SPEECH_ERROR_CODES.has(event.error)
              ? 'empty'
              : 'failed'

        finish({ ok: false, reason, message })
      }),
    )

    const fileUri = ensureFileUri(uri)

    try {
      ExpoSpeechRecognitionModule.start({
        lang: speechLocale,
        interimResults: true,
        requiresOnDeviceRecognition: Platform.OS === 'ios',
        audioSource: Platform.select({
          android: {
            uri: fileUri,
            audioEncoding: AudioEncodingAndroid.ENCODING_PCM_16BIT,
            sampleRate: androidProfile?.sampleRate ?? 16_000,
            audioChannels: androidProfile?.audioChannels ?? 1,
            chunkDelayMillis: androidProfile?.chunkDelayMillis,
          },
          default: { uri: fileUri },
        }),
      })
    } catch (error) {
      finish({
        ok: false,
        reason: 'failed',
        message: error instanceof Error ? error.message : JOURNAL_UI.transcriptionFailed,
      })
    }
  })
}

export const isJournalAudioTranscriptionAvailable = (): boolean => {
  const speech = loadSpeechModule()
  if (!speech) return false

  try {
    return speech.ExpoSpeechRecognitionModule.isRecognitionAvailable()
  } catch {
    return false
  }
}

export const transcribeJournalAudio = async (
  audioUri: string,
  speechLocale: JournalSpeechLocale = 'en-US',
): Promise<JournalTranscriptionResult> => {
  const speech = loadSpeechModule()
  if (!speech) {
    return { ok: false, reason: 'unavailable', message: JOURNAL_UI.transcriptionUnavailable }
  }

  const { ExpoSpeechRecognitionModule } = speech

  if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
    return { ok: false, reason: 'unavailable', message: JOURNAL_UI.transcriptionUnavailable }
  }

  const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
  if (!permissions.granted) {
    return { ok: false, reason: 'permission_denied', message: JOURNAL_UI.transcriptionPermissionDenied }
  }

  const profiles =
    Platform.OS === 'android'
      ? androidTranscriptionProfilesForUri(audioUri)
      : [undefined]

  let lastResult: JournalTranscriptionResult = {
    ok: false,
    reason: 'empty',
    message: JOURNAL_UI.transcriptionEmpty,
  }

  for (let index = 0; index < profiles.length; index += 1) {
    const profile = profiles[index]
    const result = await transcribeJournalAudioOnce({
      speech,
      uri: audioUri,
      speechLocale,
      androidProfile: profile,
    })

    if (result.ok) return result

    lastResult = result

    const hasAnotherProfile = index < profiles.length - 1
    if (!hasAnotherProfile || !shouldRetryTranscription(result)) {
      return result
    }
  }

  return lastResult
}
