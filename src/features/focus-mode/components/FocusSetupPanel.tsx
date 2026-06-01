import { Platform, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { Button, Card } from '@/components';
import { GameCard } from '@/components/ui/game';
import { routes } from '@/constants';
import { FocusStudyType, type FocusStudyTypeValue } from '@/types/focus-mode';

import {
  FOCUS_DURATION_OPTIONS,
  FOCUS_STUDY_TYPE_META,
} from '../constants/focus-config';
import { FocusMonitorBridge } from '../services/focus-monitor-bridge';

type FocusSetupPanelProps = {
  defaultDuration: number;
  onStart: (studyType: FocusStudyTypeValue, durationMinutes: number) => void;
};

export const FocusSetupPanel = ({ defaultDuration, onStart }: FocusSetupPanelProps) => {
  const studyTypes = Object.values(FocusStudyType);

  if (!FocusMonitorBridge.isSupported()) {
    return (
      <Card elevated>
        <Text className="text-base font-semibold text-foreground">Focus Mode</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">
          Disponível apenas no Android. Use um build nativo para ativar o monitoramento de distrações.
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-4">
      <GameCard variant="quest" glow>
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">🎯 Focus Mode</Text>
        <Text className="mt-2 text-sm leading-relaxed text-foreground-secondary">
          Sessão imersiva de estudo. Apps distrativos são fechados automaticamente — você volta ao English Quest.
        </Text>
      </GameCard>

      <Card elevated>
        <Text className="mb-3 text-sm font-semibold text-foreground">Tipo de estudo</Text>
        <View className="gap-2">
          {studyTypes.map((type) => {
            const meta = FOCUS_STUDY_TYPE_META[type];
            return (
              <Button
                key={type}
                label={`${meta.emoji} ${meta.label}`}
                variant="secondary"
                onPress={() => onStart(type, defaultDuration)}
              />
            );
          })}
        </View>
      </Card>

      <Card elevated>
        <Text className="mb-3 text-sm font-semibold text-foreground">Duração rápida</Text>
        <View className="flex-row flex-wrap gap-2">
          {FOCUS_DURATION_OPTIONS.map((minutes) => (
            <Button
              key={minutes}
              label={`${minutes} min${minutes === defaultDuration ? ' ★' : ''}`}
              variant={minutes === defaultDuration ? 'primary' : 'secondary'}
              onPress={() =>
                router.push({
                  pathname: routes.focusModeSession,
                  params: { duration: String(minutes), studyType: FocusStudyType.VOCABULARY },
                } as Href)
              }
            />
          ))}
        </View>
        {Platform.OS === 'android' ? (
          <Text className="mt-3 text-xs text-muted">
            Requer Accessibility Service ativo. Apps da lista serão fechados ao tentar abrir.
          </Text>
        ) : null}
      </Card>
    </View>
  );
};
