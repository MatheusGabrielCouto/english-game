import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { JOURNAL_UI } from '../constants/journal-ui';
import { isPersistedJournalAudioUri } from '../services/journal-audio-storage';
import { JournalVoicePlayer } from './JournalVoicePlayer';
import { JournalVoiceRecorder } from './JournalVoiceRecorder';

type JournalEntryOptionalAudioProps = {
  entryId: string;
  recordingUri: string | null;
  durationMs: number;
  persistedUri: string | null;
  persistedDurationMs?: number;
  onRecordingChange: (uri: string | null, durationMs: number) => void;
  onRecordingComplete?: (uri: string, durationMs: number) => void;
  isTranscribing?: boolean;
  processingLabel?: string;
};

export const JournalEntryOptionalAudio = ({
  entryId,
  recordingUri,
  durationMs,
  persistedUri,
  persistedDurationMs = 0,
  onRecordingChange,
  onRecordingComplete,
  isTranscribing = false,
  processingLabel,
}: JournalEntryOptionalAudioProps) => {
  const [replacing, setReplacing] = useState(false);

  const showingPersisted =
    Boolean(persistedUri) &&
    !replacing &&
    recordingUri === persistedUri &&
    isPersistedJournalAudioUri(recordingUri);

  const handleRemove = () => {
    setReplacing(false);
    onRecordingChange(null, 0);
  };

  if (showingPersisted && recordingUri) {
    return (
      <View className="gap-3">
        <View>
          <Text className="text-sm font-semibold text-foreground">{JOURNAL_UI.optionalAudioLabel}</Text>
          <Text className="mt-1 text-xs text-foreground-secondary">{JOURNAL_UI.optionalAudioHint}</Text>
        </View>
        <JournalVoicePlayer
          entryId={entryId}
          audioUri={recordingUri}
          durationMs={durationMs}
          awardReplayXp={false}
        />
        <View className="flex-row flex-wrap gap-3">
          <Pressable
            onPress={() => setReplacing(true)}
            accessibilityRole="button"
            accessibilityLabel={JOURNAL_UI.replaceAudio}>
            <Text className="text-sm font-semibold text-primary">{JOURNAL_UI.replaceAudio}</Text>
          </Pressable>
          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={JOURNAL_UI.removeAudio}>
            <Text className="text-sm font-semibold text-danger">{JOURNAL_UI.removeAudio}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <View>
        <Text className="text-sm font-semibold text-foreground">{JOURNAL_UI.optionalAudioLabel}</Text>
        <Text className="mt-1 text-xs text-foreground-secondary">{JOURNAL_UI.optionalAudioHint}</Text>
      </View>
      <JournalVoiceRecorder
        recordingUri={recordingUri}
        durationMs={durationMs}
        isTranscribing={isTranscribing}
        processingLabel={processingLabel}
        onRecordingChange={(uri, ms) => {
          onRecordingChange(uri, ms);
          if (uri) setReplacing(false);
        }}
        onRecordingComplete={onRecordingComplete}
      />
      {persistedUri && replacing ? (
        <Pressable
          onPress={() => {
            setReplacing(false);
            onRecordingChange(persistedUri, persistedDurationMs);
          }}
          accessibilityRole="button"
          accessibilityLabel={JOURNAL_UI.cancel}>
          <Text className="text-sm font-semibold text-muted">{JOURNAL_UI.cancel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
