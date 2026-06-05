import { useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { GameCard } from '@/components/ui/game';
import { FocusStudyType, type FocusStudyTypeValue } from '@/types/focus-mode';

import { FOCUS_STUDY_TYPE_META } from '../constants/focus-config';
import { FocusMonitorBridge } from '../services/focus-monitor-bridge';
import { clampFocusDurationMinutes } from '../utils/focus-duration-input';
import { FocusDurationPicker } from './FocusDurationPicker';

type FocusSetupPanelProps = {
  defaultDuration: number;
  onStart: (studyType: FocusStudyTypeValue, durationMinutes: number) => void;
};

export const FocusSetupPanel = ({ defaultDuration, onStart }: FocusSetupPanelProps) => {
  const studyTypes = Object.values(FocusStudyType);
  const [durationMinutes, setDurationMinutes] = useState(() =>
    clampFocusDurationMinutes(defaultDuration),
  );

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

  const handleStart = (studyType: FocusStudyTypeValue) => {
    onStart(studyType, clampFocusDurationMinutes(durationMinutes));
  };

  return (
    <View className="gap-4">
      <GameCard variant="quest" glow>
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">🎯 Focus Mode</Text>
        <Text className="mt-2 text-sm leading-relaxed text-foreground-secondary">
          Sessão imersiva de estudo. Apps distrativos são fechados automaticamente — você volta ao English Quest.
        </Text>
      </GameCard>

      <Card elevated>
        <FocusDurationPicker valueMinutes={durationMinutes} onChangeMinutes={setDurationMinutes} />
      </Card>

      <Card elevated>
        <Text className="mb-1 text-sm font-semibold text-foreground">Tipo de estudo</Text>
        <Text className="mb-3 text-xs text-muted">
          Timer de {clampFocusDurationMinutes(durationMinutes)} min — escolha o que vai praticar
        </Text>
        <View className="gap-2">
          {studyTypes.map((type) => {
            const meta = FOCUS_STUDY_TYPE_META[type];
            return (
              <Button
                key={type}
                label={`${meta.emoji} ${meta.label}`}
                variant="secondary"
                onPress={() => handleStart(type)}
              />
            );
          })}
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
