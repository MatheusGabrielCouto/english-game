import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
    LayoutChangeEvent,
    Pressable,
    Text,
    View,
    type GestureResponderEvent,
} from 'react-native';

import { cn } from '@/utils';

import { JOURNAL_UI } from '../constants/journal-ui';
import { JournalService } from '../services/journal-service';
import { useJournalVoicePlayback } from '../services/journal-voice-playback';

const formatTime = (seconds: number): string => {
  const totalSec = Math.max(0, Math.floor(seconds));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

type JournalVoicePlayerProps = {
  entryId: string;
  audioUri: string;
  durationMs?: number | null;
  compact?: boolean;
  className?: string;
  awardReplayXp?: boolean;
};

export const JournalVoicePlayer = ({
  entryId,
  audioUri,
  durationMs,
  compact = false,
  className,
  awardReplayXp = true,
}: JournalVoicePlayerProps) => {
  const activeEntryId = useJournalVoicePlayback((s) => s.entryId);
  const isPlaying = useJournalVoicePlayback((s) => s.isPlaying);
  const currentTime = useJournalVoicePlayback((s) => s.currentTime);
  const duration = useJournalVoicePlayback((s) => s.duration);
  const toggle = useJournalVoicePlayback((s) => s.toggle);
  const play = useJournalVoicePlayback((s) => s.play);
  const seekToRatio = useJournalVoicePlayback((s) => s.seekToRatio);

  const isActive = activeEntryId === entryId;
  const playing = isActive && isPlaying;
  const fallbackSec = durationMs ? durationMs / 1000 : 0;
  const totalSec = isActive && duration > 0 ? duration : fallbackSec;
  const progress = totalSec > 0 ? Math.min(1, (isActive ? currentTime : 0) / totalSec) : 0;
  const displayTime =
    playing || (isActive && currentTime > 0)
      ? formatTime(isActive ? currentTime : 0)
      : formatTime(totalSec);

  const [trackWidth, setTrackWidth] = useState(0);
  const playSize = compact ? 28 : 32;
  const iconSize = compact ? 14 : 16;

  const handleToggle = useCallback(async () => {
    if (!playing && awardReplayXp) {
      await JournalService.replayVoice(entryId);
    }
    await toggle(entryId, audioUri, durationMs ?? undefined);
  }, [audioUri, awardReplayXp, durationMs, entryId, playing, toggle]);

  const handleSeek = useCallback(
    async (event: GestureResponderEvent) => {
      if (trackWidth <= 0) return;
      const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / trackWidth));
      if (!isActive) {
        if (awardReplayXp) {
          await JournalService.replayVoice(entryId);
        }
        await play(entryId, audioUri, durationMs ?? undefined);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      await seekToRatio(ratio);
    },
    [audioUri, awardReplayXp, durationMs, entryId, isActive, play, seekToRatio, trackWidth],
  );

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      className={cn(
        'flex-row items-center gap-2 rounded-xl bg-surface px-2 py-1.5',
        compact && 'py-1',
        className,
      )}>
      <Pressable
        onPress={() => void handleToggle()}
        accessibilityRole="button"
        accessibilityLabel={playing ? JOURNAL_UI.pausePlayback : JOURNAL_UI.playPlayback}
        className="shrink-0 items-center justify-center rounded-full bg-primary/20"
        style={{ width: playSize, height: playSize }}>
        <Ionicons
          name={playing ? 'pause' : 'play'}
          size={iconSize}
          color="#8b5cf6"
          style={playing ? undefined : { marginLeft: 1 }}
        />
      </Pressable>

      <Pressable
        onPress={(e) => void handleSeek(e)}
        onLayout={handleTrackLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={JOURNAL_UI.seekPlayback}
        className="min-h-[20px] flex-1 justify-center py-1">
        <View className="h-1 overflow-hidden rounded-full bg-border">
          <View className="h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
        </View>
      </Pressable>

      <Text className="shrink-0 font-mono text-[10px] font-medium text-muted">{displayTime}</Text>
    </View>
  );
};
