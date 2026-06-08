import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'

import { AppIcon } from '@/components/ui/AppIcon'
import { theme } from '@/constants'
import { INPUT_PLACEHOLDER_COLOR } from '@/constants/input-ui'
import { isJournalAudioTranscriptionAvailable } from '@/features/english-journal/services/journal-audio-transcription'
import { JOURNAL_VOICE_RECORDING_OPTIONS } from '@/features/english-journal/constants/journal-voice-recording'
import { useJournalVoicePlayback } from '@/features/english-journal/services/journal-voice-playback'
import { prepareAudioSessionForRecording } from '@/services/audio/audio-playback'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import {
  DEFAULT_MENTOR_VOICE_MODE,
  MENTOR_VOICE_MODE_STORAGE_KEY,
  processMentorVoiceRecording,
  type MentorVoiceSpeakingMode,
} from '../utils/mentor-voice-speaking'

export type MentorSpeakingSendOptions = {
  llmText?: string
}

type MentorSpeakingComposerProps = {
  disabled?: boolean
  isGenerating?: boolean
  placeholder?: string
  inputA11y?: string
  onSend: (text: string, options?: MentorSpeakingSendOptions) => void
}

type RecorderBundle = {
  AudioModule: typeof import('expo-audio').AudioModule
  useAudioRecorder: typeof import('expo-audio').useAudioRecorder
  useAudioRecorderState: typeof import('expo-audio').useAudioRecorderState
  setAudioModeAsync: typeof import('expo-audio').setAudioModeAsync
}

const INPUT_CLASS =
  'max-h-32 min-h-[44px] flex-1 rounded-3xl border border-border/70 bg-surface px-4 py-2.5 text-[15px] text-foreground'

const loadRecorderBundle = (): RecorderBundle | null => {
  try {
    return require('expo-audio') as RecorderBundle
  } catch {
    return null
  }
}

const formatDuration = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000)
  const sec = totalSec % 60
  return `0:${sec.toString().padStart(2, '0')}`
}

type VoicePhase = 'idle' | 'recording' | 'transcribing' | 'translating'

const TextOnlyComposer = ({
  disabled,
  isGenerating,
  placeholder,
  inputA11y,
  onSend,
}: MentorSpeakingComposerProps) => {
  const [draft, setDraft] = useState('')
  const canSend = !disabled && !isGenerating && draft.trim().length > 0

  return (
    <View className="flex-row items-end gap-2 px-1 pt-2">
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
        multiline
        editable={!disabled}
        className={INPUT_CLASS}
        accessibilityLabel={inputA11y}
      />
      <Pressable
        onPress={() => {
          if (!canSend) return
          const text = draft.trim()
          setDraft('')
          onSend(text)
        }}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={MENTOR_AI_UI.chat.send}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          canSend ? 'bg-primary active:opacity-80' : 'bg-primary/40'
        }`}>
        <AppIcon name="send" size={20} color={theme.colors.foreground} strokeWidth={2.2} />
      </Pressable>
    </View>
  )
}

const VoiceEnabledComposer = ({
  disabled,
  isGenerating,
  placeholder,
  inputA11y,
  onSend,
  bundle,
}: MentorSpeakingComposerProps & { bundle: RecorderBundle }) => {
  const { AudioModule, useAudioRecorder, useAudioRecorderState, setAudioModeAsync } = bundle
  const recorder = useAudioRecorder(JOURNAL_VOICE_RECORDING_OPTIONS)
  const recorderState = useAudioRecorderState(recorder)
  const startedAtRef = useRef<number | null>(null)

  const [draft, setDraft] = useState('')
  const [voiceMode, setVoiceMode] = useState<MentorVoiceSpeakingMode>(DEFAULT_MENTOR_VOICE_MODE)
  const [phase, setPhase] = useState<VoicePhase>('idle')
  const [durationMs, setDurationMs] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const isRecording = phase === 'recording'
  const isProcessing = phase === 'transcribing' || phase === 'translating'

  useEffect(() => {
    void AsyncStorage.getItem(MENTOR_VOICE_MODE_STORAGE_KEY).then((raw) => {
      if (raw === 'english' || raw === 'portuguese_to_english') {
        setVoiceMode(raw)
      }
    })
  }, [])

  useEffect(() => {
    if (!isRecording) return
    const tick = setInterval(() => {
      if (startedAtRef.current == null) return
      setDurationMs(Date.now() - startedAtRef.current)
    }, 400)
    return () => clearInterval(tick)
  }, [isRecording])

  const handleVoiceModeChange = useCallback(() => {
    const next = voiceMode === 'english' ? 'portuguese_to_english' : 'english'
    setVoiceMode(next)
    void AsyncStorage.setItem(MENTOR_VOICE_MODE_STORAGE_KEY, next)
  }, [voiceMode])

  const startRecording = useCallback(async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync()
    if (!status.granted) {
      Alert.alert('Microfone', MENTOR_AI_UI.voice.micPermissionDenied)
      return
    }

    useJournalVoicePlayback.getState().stop()

    const ready = await prepareAudioSessionForRecording()
    if (!ready) {
      Alert.alert('Gravação', MENTOR_AI_UI.voice.recordingFailed)
      return
    }

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    await recorder.prepareToRecordAsync()
    recorder.record()
    startedAtRef.current = Date.now()
    setDurationMs(0)
    setError(null)
    setPhase('recording')
  }, [AudioModule, recorder, setAudioModeAsync])

  const stopRecordingAndProcess = useCallback(async () => {
    if (!recorderState.isRecording) return

    await recorder.stop()
    startedAtRef.current = null
    setPhase('transcribing')

    const uri = recorder.uri
    if (!uri) {
      setPhase('idle')
      setError(MENTOR_AI_UI.voice.recordingFailed)
      return
    }

    const processed = await processMentorVoiceRecording(uri, voiceMode, (pipelinePhase) => {
      setPhase(pipelinePhase)
    })

    setPhase('idle')

    if (!processed.ok) {
      setError(processed.message)
      return
    }

    setError(null)
    onSend(processed.result.displayText, { llmText: processed.result.llmText })
  }, [onSend, recorder, recorderState.isRecording, voiceMode])

  const toggleRecording = useCallback(async () => {
    if (isProcessing) return
    if (isRecording) {
      await stopRecordingAndProcess()
      return
    }
    await startRecording()
  }, [isProcessing, isRecording, startRecording, stopRecordingAndProcess])

  const canSend =
    !disabled && !isGenerating && !isProcessing && !isRecording && draft.trim().length > 0

  const processingLabel =
    phase === 'translating' ? MENTOR_AI_UI.voice.translating : MENTOR_AI_UI.voice.transcribing

  return (
    <View className="gap-2 px-1 pt-2">
      <View className="flex-row items-center justify-between gap-2 px-1">
        <Pressable
          onPress={handleVoiceModeChange}
          disabled={isProcessing || isRecording || disabled}
          accessibilityRole="button"
          accessibilityLabel={MENTOR_AI_UI.voice.modeA11y(voiceMode)}
          className="rounded-full border border-border/70 bg-background/60 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-foreground-secondary">
            {MENTOR_AI_UI.voice.modeLabel(voiceMode)}
          </Text>
        </Pressable>
        {isRecording ? (
          <Text className="font-mono text-xs font-bold text-danger">
            {MENTOR_AI_UI.voice.recording} {formatDuration(durationMs)}
          </Text>
        ) : null}
        {isProcessing ? (
          <Text className="text-xs font-semibold text-primary">{processingLabel}</Text>
        ) : null}
      </View>

      {error ? (
        <Text className="px-1 text-xs text-warning" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <View className="flex-row items-end gap-2">
        <Pressable
          onPress={() => void toggleRecording()}
          disabled={disabled || isGenerating || isProcessing}
          accessibilityRole="button"
          accessibilityLabel={
            isRecording ? MENTOR_AI_UI.voice.stopRecording : MENTOR_AI_UI.voice.startRecording
          }
          className={`h-11 w-11 items-center justify-center rounded-full ${
            isRecording ? 'bg-danger' : 'bg-surface-elevated border border-border/70'
          }`}>
          <Text className="text-lg">{isRecording ? '⏹' : '🎙️'}</Text>
        </Pressable>

        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
          multiline
          editable={!disabled && !isRecording && !isProcessing}
          className={INPUT_CLASS}
          accessibilityLabel={inputA11y}
        />

        <Pressable
          onPress={() => {
            if (!canSend) return
            const text = draft.trim()
            setDraft('')
            onSend(text)
          }}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={MENTOR_AI_UI.voice.send}
          className={`h-11 w-11 items-center justify-center rounded-full ${
            canSend ? 'bg-primary active:opacity-80' : 'bg-primary/40'
          }`}>
          <AppIcon name="send" size={20} color={theme.colors.foreground} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  )
}

export const MentorSpeakingComposer = (props: MentorSpeakingComposerProps) => {
  const bundle = loadRecorderBundle()
  const voiceAvailable = Boolean(bundle) && isJournalAudioTranscriptionAvailable()

  if (!voiceAvailable || !bundle) {
    return <TextOnlyComposer {...props} />
  }

  return <VoiceEnabledComposer {...props} bundle={bundle} />
}
