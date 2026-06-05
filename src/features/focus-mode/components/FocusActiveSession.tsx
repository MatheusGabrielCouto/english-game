import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Button, ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { FOCUS_MESSAGES, FOCUS_STUDY_TYPE_META } from '@/features/focus-mode/constants/focus-config';
import { getDisplayFocusedSeconds } from '@/features/focus-mode/utils/focus-session-display';
import { usePet } from '@/features/pet/hooks/use-pet';
import { getPetDisplayInfo } from '@/features/pet/utils/display';
import type { FocusLiveSessionState } from '@/types/focus-mode';

type FocusActiveSessionProps = {
  liveSession: FocusLiveSessionState;
  onComplete: () => void;
  onAbandon: () => void;
  onTimerEnded?: () => void;
};

const formatTimer = (totalSec: number): string => {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const FocusActiveSession = ({
  liveSession,
  onComplete,
  onAbandon,
  onTimerEnded,
}: FocusActiveSessionProps) => {
  const { pet } = usePet();
  const bounce = useSharedValue(0);
  const { session, remainingSec, elapsedSec, trackingState, currentDistractionPackage } = liveSession;
  const displayFocusedSec = getDisplayFocusedSeconds(session, elapsedSec);

  const display = pet ? getPetDisplayInfo(pet) : null;
  const studyMeta = FOCUS_STUDY_TYPE_META[session.studyType];
  const progress = useMemo(
    () => Math.min(100, Math.round((elapsedSec / session.plannedDurationSec) * 100)),
    [elapsedSec, session.plannedDurationSec],
  );

  useEffect(() => {
    if (remainingSec > 0 || !onTimerEnded) return;
    onTimerEnded();
  }, [remainingSec, onTimerEnded]);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(-8, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [bounce]);

  const petStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const statusLabel =
    trackingState === 'distracted'
      ? `Distraído · ${currentDistractionPackage ?? 'app'}`
      : trackingState === 'paused'
        ? 'Pausado'
        : trackingState === 'focusing'
          ? 'Focado'
          : 'Aguardando';

  return (
    <View className="gap-5">
      <GameCard variant="hero" glow className="items-center py-8">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">
          {studyMeta.emoji} {studyMeta.label}
        </Text>
        <Text className="mt-6 text-6xl font-black tabular-nums text-foreground">
          {formatTimer(remainingSec)}
        </Text>
        <Text className="mt-2 text-sm text-muted">{statusLabel}</Text>
        <Text className="mt-2 px-4 text-center text-xs leading-relaxed text-warning">
          {FOCUS_MESSAGES.blockingActive}
        </Text>

        <Animated.View style={petStyle} className="mt-6">
          <Text className="text-[88px] leading-none">{display?.displayEmoji ?? '🦉'}</Text>
        </Animated.View>
        <Text className="mt-3 text-lg font-bold text-foreground">{display?.name ?? 'Buddy'}</Text>

        <View className="mt-6 w-full px-2">
          <ProgressBar value={progress} variant="gold" height="md" showLabel />
        </View>

        <View className="mt-4 flex-row gap-4">
          <View className="items-center">
            <Text className="text-xs text-muted">Foco</Text>
            <Text className="text-base font-bold text-success">{formatTimer(displayFocusedSec)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-muted">Distração</Text>
            <Text className="text-base font-bold text-warning">{formatTimer(session.distractedSeconds)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-muted">XP acum.</Text>
            <Text className="text-base font-bold text-xp">+{Math.round(displayFocusedSec / 12)}</Text>
          </View>
        </View>
      </GameCard>

      <View className="gap-3">
        <Button label="Concluir sessão" onPress={onComplete} />
        <Button label="Encerrar antes" variant="secondary" onPress={onAbandon} />
        <Text className="text-center text-xs text-muted">
          Encerrar antes ou concluir cedo reduz XP e moedas pelo tempo restante
        </Text>
      </View>
    </View>
  );
};
