import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Card } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import { routes, theme } from '@/constants';
import type { FocusStudyTypeValue } from '@/types/focus-mode';

import { useFocusMode } from '../hooks/use-focus-mode';
import { FocusModeService } from '../services/focus-mode-service';
import { FocusSetupPanel } from './FocusSetupPanel';

export const FocusModeScreenContent = () => {
  const { settings, analytics, isLoading, startSession, refresh } = useFocusMode();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleStart = async (studyType: FocusStudyTypeValue, durationMinutes: number) => {
    const session = await startSession(studyType, durationMinutes);
    if (!session) return;
    await FocusModeService.ensureLiveSession();
    router.push(routes.focusModeSession as Href);
  };

  if (isLoading || !settings) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-3 text-sm text-foreground-secondary">Carregando Focus Mode...</Text>
      </View>
    );
  }

  return (
    <View className="gap-5 pb-8">
      {analytics ? (
        <GameCard variant="reward">
          <Text className="text-xs font-bold uppercase tracking-widest text-gold">Analytics</Text>
          <View className="mt-3 gap-2">
            <View className="flex-row gap-2">
              <StatPill
                label="Concluídas"
                value={analytics.completedSessions}
                emoji="✅"
                tone="success"
                className="flex-1"
              />
              <StatPill
                label="Foco total"
                value={`${Math.round(analytics.totalFocusSeconds / 60)}m`}
                emoji="⏱️"
                tone="primary"
                className="flex-1"
              />
            </View>
            <View className="flex-row gap-2">
              <StatPill
                label="XP foco"
                value={analytics.totalXpEarned}
                emoji="⚡"
                tone="gold"
                className="flex-1"
              />
              <StatPill
                label="Distrações"
                value={`${Math.round(analytics.totalDistractionSeconds / 60)}m`}
                emoji="📵"
                tone="warning"
                className="flex-1"
              />
            </View>
          </View>
        </GameCard>
      ) : null}

      {!settings.enabled ? (
        <Card elevated>
          <Text className="text-sm text-foreground-secondary">
            Focus Mode está desativado. Ative em Perfil → Configurações.
          </Text>
        </Card>
      ) : (
        <FocusSetupPanel
          defaultDuration={settings.defaultDurationMinutes}
          onStart={(studyType, duration) => void handleStart(studyType, duration)}
        />
      )}
    </View>
  );
};
