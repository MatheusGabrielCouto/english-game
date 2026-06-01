import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { routes, theme } from '@/constants';
import { FocusStudyType, type FocusStudyTypeValue } from '@/types/focus-mode';

import { FocusActiveSession } from '@/features/focus-mode/components/FocusActiveSession';
import { useFocusMode } from '@/features/focus-mode/hooks/use-focus-mode';
import { FocusModeService } from '@/features/focus-mode/services/focus-mode-service';

export default function FocusSessionScreen() {
  const params = useLocalSearchParams<{ duration?: string; studyType?: string }>();
  const { activeSession, liveSession, isLoading, startSession, completeSession, abandonSession } =
    useFocusMode();

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

    const duration = Number(params.duration ?? 30);
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

  if (!liveSession) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title="Sessão ativa" subtitle="Mantenha o foco" emoji="🎯" />
      <FocusActiveSession liveSession={liveSession} onComplete={() => void handleComplete()} onAbandon={() => void handleAbandon()} />
    </ScreenContainer>
  );
}
