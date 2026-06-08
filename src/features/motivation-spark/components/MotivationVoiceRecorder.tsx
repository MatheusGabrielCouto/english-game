import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { Button } from '@/components'
import { JournalVoicePlayer } from '@/features/english-journal/components/JournalVoicePlayer'
import { useJournalVoicePlayback } from '@/features/english-journal/services/journal-voice-playback'
import { prepareAudioSessionForRecording } from '@/services/audio/audio-playback'
import { cn } from '@/utils'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { MOTIVATION_VOICE_RECORDING_OPTIONS } from '../constants/motivation-voice-recording'

type MotivationVoiceRecorderProps = {
  recordingUri: string | null
  durationMs: number
  onRecordingChange: (uri: string | null, durationMs: number) => void
  onRecordingComplete?: (uri: string, durationMs: number) => void
}

type RecorderBundle = {
  AudioModule: typeof import('expo-audio').AudioModule
  useAudioRecorder: typeof import('expo-audio').useAudioRecorder
  useAudioRecorderState: typeof import('expo-audio').useAudioRecorderState
  setAudioModeAsync: typeof import('expo-audio').setAudioModeAsync
}

const loadRecorderBundle = (): RecorderBundle | null => {
  try {
    return require('expo-audio') as RecorderBundle
  } catch {
    return null
  }
}

const formatDuration = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const InnerRecorder = ({
  recordingUri,
  durationMs,
  onRecordingChange,
  onRecordingComplete,
  bundle,
}: MotivationVoiceRecorderProps & { bundle: RecorderBundle }) => {
  const { AudioModule, useAudioRecorder, useAudioRecorderState, setAudioModeAsync } = bundle
  const recorder = useAudioRecorder(MOTIVATION_VOICE_RECORDING_OPTIONS)
  const recorderState = useAudioRecorderState(recorder)
  const startedAtRef = useRef<number | null>(null)
  const accumulatedMsRef = useRef(durationMs)
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    void (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      setPermissionGranted(status.granted)
      if (!status.granted) return
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    })()
  }, [AudioModule, setAudioModeAsync])

  useEffect(() => {
    if (!recorderState.isRecording) return
    const tick = setInterval(() => {
      if (startedAtRef.current == null) return
      const elapsed = Date.now() - startedAtRef.current
      onRecordingChange(recordingUri, accumulatedMsRef.current + elapsed)
    }, 500)
    return () => clearInterval(tick)
  }, [recorderState.isRecording, onRecordingChange, recordingUri])

  const beginRecording = useCallback(async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync()
    if (!status.granted) {
      Alert.alert('Microfone', MOTIVATION_UI.form.micPermissionDenied)
      return false
    }
    setPermissionGranted(true)

    useJournalVoicePlayback.getState().stop()

    const ready = await prepareAudioSessionForRecording()
    if (!ready) {
      Alert.alert('Gravação', 'Não foi possível preparar o microfone. Tente novamente.')
      return false
    }

    await recorder.prepareToRecordAsync()
    recorder.record()
    startedAtRef.current = Date.now()
    return true
  }, [AudioModule, recorder])

  const handlePause = useCallback(async () => {
    if (!recorderState.isRecording) return
    await recorder.stop()
    if (startedAtRef.current != null) {
      accumulatedMsRef.current += Date.now() - startedAtRef.current
      startedAtRef.current = null
    }
    if (recorder.uri) {
      onRecordingChange(recorder.uri, accumulatedMsRef.current)
    }
  }, [onRecordingChange, recorder, recorderState.isRecording])

  const handleResume = useCallback(async () => {
    try {
      await beginRecording()
    } catch {
      Alert.alert('Gravação', 'Não foi possível continuar a gravação. Tente gravar de novo.')
    }
  }, [beginRecording])

  const handleFinish = useCallback(async () => {
    if (recorderState.isRecording) {
      await recorder.stop()
      if (startedAtRef.current != null) {
        accumulatedMsRef.current += Date.now() - startedAtRef.current
        startedAtRef.current = null
      }
    }
    if (recorder.uri) {
      onRecordingChange(recorder.uri, accumulatedMsRef.current)
      onRecordingComplete?.(recorder.uri, accumulatedMsRef.current)
    }
  }, [onRecordingChange, onRecordingComplete, recorder, recorderState.isRecording])

  const handleDelete = useCallback(() => {
    accumulatedMsRef.current = 0
    startedAtRef.current = null
    onRecordingChange(null, 0)
  }, [onRecordingChange])

  const isRecording = recorderState.isRecording
  const hasClip = Boolean(recordingUri)

  return (
    <View className="rounded-2xl border border-border bg-surface p-4">
      <Text className="text-sm font-semibold text-foreground">{MOTIVATION_UI.form.recordVoice}</Text>
      <Text className="mt-1 text-xs text-foreground-secondary">{MOTIVATION_UI.form.recordingHint}</Text>

      <View className="mt-4 items-center">
        <View
          className={cn(
            'h-20 w-20 items-center justify-center rounded-full border-2',
            isRecording ? 'border-danger bg-danger/15' : 'border-primary bg-primary/15',
          )}
        >
          <Text className="text-3xl">{isRecording ? '⏺' : '🎙️'}</Text>
        </View>
        <Text className="mt-2 font-mono text-lg text-foreground">
          {formatDuration(hasClip || isRecording ? durationMs : 0)}
        </Text>
      </View>

      {hasClip && recordingUri && !isRecording ? (
        <View className="mt-4">
          <JournalVoicePlayer
            entryId={`motivation-preview-${recordingUri}`}
            audioUri={recordingUri}
            durationMs={durationMs}
            awardReplayXp={false}
          />
        </View>
      ) : null}

      <View className="mt-4 flex-row flex-wrap justify-center gap-2">
        {!isRecording && !hasClip ? (
          <Button
            label="Gravar"
            size="sm"
            onPress={() => {
              void (async () => {
                try {
                  await beginRecording()
                } catch {
                  Alert.alert('Gravação', 'Não foi possível iniciar a gravação. Tente novamente.')
                }
              })()
            }}
          />
        ) : null}
        {isRecording ? (
          <>
            <Button
              label={MOTIVATION_UI.form.pauseRecording}
              size="sm"
              variant="secondary"
              onPress={() => void handlePause()}
            />
            <Button
              label={MOTIVATION_UI.form.finishRecording}
              size="sm"
              onPress={() => void handleFinish()}
            />
          </>
        ) : null}
        {!isRecording && hasClip ? (
          <>
            <Button
              label={MOTIVATION_UI.form.resumeRecording}
              size="sm"
              onPress={() => void handleResume()}
            />
            <Button
              label={MOTIVATION_UI.form.finishRecording}
              size="sm"
              onPress={() => void handleFinish()}
            />
            <Pressable
              onPress={handleDelete}
              accessibilityRole="button"
              accessibilityLabel={MOTIVATION_UI.form.deleteRecording}
            >
              <Text className="px-3 py-2 text-sm font-semibold text-danger">
                {MOTIVATION_UI.form.deleteRecording}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  )
}

export const MotivationVoiceRecorder = (props: MotivationVoiceRecorderProps) => {
  const bundle = loadRecorderBundle()
  if (!bundle) {
    return (
      <View className="rounded-2xl border border-border bg-surface p-4">
        <Text className="text-sm text-muted">
          Gravação indisponível. Recompile o app com expo-audio.
        </Text>
      </View>
    )
  }
  return <InnerRecorder {...props} bundle={bundle} />
}
