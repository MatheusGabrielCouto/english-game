import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { routes } from '@/constants';
import { FocusStudyType, type FocusStudyTypeValue } from '@/types/focus-mode';

import { FocusActiveSession } from '@/features/focus-mode/components/FocusActiveSession';
import { useFocusMode } from '@/features/focus-mode/hooks/use-focus-mode';
import { FocusModeService } from '@/features/focus-mode/services/focus-mode-service';
import { clampFocusDurationMinutes } from '@/features/focus-mode/utils/focus-duration-input';

export default function FocusSessionScreen() {
  const params = useLocalSearchParams<{ duration?: string; studyType?: string }>();
  const { activeSession, liveSession, isLoading, startSession, completeSession, abandonSession } =
    useFocusMode();

  useEffect(() => {
    if (liveSession) {
      void FocusModeService.ensureLiveSession();
    }
  }, [liveSession?.session.id]);

  useEffect(() => {
    if (isLoading) return;

    if (activeSession && !liveSession) {
      void FocusModeService.ensureLiveSession();
      return;
    }

    if (activeSession) return;

    const hasExplicitStart =
      params.duration !== undefined || params.studyType !== undefined;

    if (!hasExplicitStart) {
      router.replace(routes.focusMode as Href);
      return;
    }

    const duration = clampFocusDurationMinutes(Number(params.duration ?? 30));
    const studyType = (params.studyType ?? FocusStudyType.VOCABULARY) as FocusStudyTypeValue;
    void startSession(studyType, duration);
  }, [activeSession, isLoading, liveSession, params.duration, params.studyType, startSession]);

  const handleComplete = async () => {
    if (!activeSession) return;
    await completeSession(activeSession.id);
    router.replace(routes.focusMode as Href);
  };

  const handleAbandon = async () => {
    await abandonSession('user');
    router.replace(routes.focusMode as Href);
  };

  const timerEndedHandled = useRef(false);

  useEffect(() => {
    timerEndedHandled.current = false;
  }, [activeSession?.id]);

  const handleTimerEnded = useCallback(() => {
    if (timerEndedHandled.current || !activeSession) return;
    timerEndedHandled.current = true;
    void completeSession(activeSession.id).then(() => {
      router.replace(routes.focusMode as Href);
    });
  }, [activeSession, completeSession]);

  if (!liveSession) {
    return (
      <View className="flex-1 bg-background px-4 pt-8">
        <ScreenSkeleton variant="focus" />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title="Sessão ativa" subtitle="Mantenha o foco" emoji="🎯" />
      <FocusActiveSession
        liveSession={liveSession}
        onComplete={() => void handleComplete()}
        onAbandon={() => void handleAbandon()}
        onTimerEnded={handleTimerEnded}
      />
    </ScreenContainer>
  );
}
