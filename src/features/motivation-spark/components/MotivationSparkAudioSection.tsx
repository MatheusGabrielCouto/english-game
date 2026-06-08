import * as DocumentPicker from 'expo-document-picker'
import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { JournalVoicePlayer } from '@/features/english-journal/components/JournalVoicePlayer'

import { MOTIVATION_MAX_AUDIO_DURATION_MS } from '../constants/motivation-limits'
import { MOTIVATION_UI } from '../constants/motivation-ui'
import { isPersistedMotivationAudioUri } from '../services/motivation-audio-storage'
import { MotivationVoiceRecorder } from './MotivationVoiceRecorder'

type MotivationSparkAudioSectionProps = {
  sparkId?: string
  recordingUri: string | null
  durationMs: number
  persistedUri: string | null
  persistedDurationMs?: number
  onRecordingChange: (uri: string | null, durationMs: number) => void
}

export const MotivationSparkAudioSection = ({
  sparkId = 'draft',
  recordingUri,
  durationMs,
  persistedUri,
  persistedDurationMs = 0,
  onRecordingChange,
}: MotivationSparkAudioSectionProps) => {
  const [replacing, setReplacing] = useState(false)
  const [importing, setImporting] = useState(false)

  const showingPersisted =
    Boolean(persistedUri) &&
    !replacing &&
    recordingUri === persistedUri &&
    isPersistedMotivationAudioUri(recordingUri)

  const handleImportAudio = async () => {
    if (importing) return
    setImporting(true)
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
      })
      if (result.canceled || !result.assets?.[0]?.uri) return

      const asset = result.assets[0]
      const estimatedMs = asset.size ? Math.min(asset.size / 16, MOTIVATION_MAX_AUDIO_DURATION_MS) : 0
      onRecordingChange(asset.uri, estimatedMs)
      setReplacing(false)
    } catch {
      Alert.alert('Áudio', 'Não foi possível importar o arquivo.')
    } finally {
      setImporting(false)
    }
  }

  const handleRemove = () => {
    setReplacing(false)
    onRecordingChange(null, 0)
  }

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-semibold text-foreground">{MOTIVATION_UI.form.audioLabel}</Text>
        <Text className="mt-1 text-xs text-foreground-secondary">{MOTIVATION_UI.form.audioHint}</Text>
      </View>

      {showingPersisted && recordingUri ? (
        <View className="gap-3">
          <JournalVoicePlayer
            entryId={`motivation-${sparkId}`}
            audioUri={recordingUri}
            durationMs={persistedDurationMs}
            awardReplayXp={false}
          />
          <View className="flex-row flex-wrap gap-3">
            <Pressable
              onPress={() => setReplacing(true)}
              className="rounded-xl border border-border bg-surface px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel={MOTIVATION_UI.form.replaceAudio}
            >
              <Text className="text-sm font-semibold text-primary">{MOTIVATION_UI.form.replaceAudio}</Text>
            </Pressable>
            <Pressable
              onPress={handleRemove}
              className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel={MOTIVATION_UI.form.removeAudio}
            >
              <Text className="text-sm font-semibold text-danger">{MOTIVATION_UI.form.removeAudio}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <MotivationVoiceRecorder
            recordingUri={recordingUri}
            durationMs={durationMs}
            onRecordingChange={onRecordingChange}
          />
          <Pressable
            onPress={() => void handleImportAudio()}
            disabled={importing}
            className="self-start rounded-xl border border-border bg-surface px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel={MOTIVATION_UI.form.importAudio}
          >
            <Text className="text-sm font-semibold text-primary">
              {importing ? '…' : `📁 ${MOTIVATION_UI.form.importAudio}`}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  )
}
