import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { CORE_LOOP_STEPS } from '@/features/metagame/constants/metagame-catalog';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';
import {
  getActiveCoreLoopStep,
  getD1Hook,
  getRetentionMessage,
} from '@/features/retention/constants/core-loop';
import { cn } from '@/utils';

export const CoreLoopCard = () => {
  const coreLoop = useMetagameStore((state) => state.coreLoop);

  if (!coreLoop) {
    return (
      <GameCard variant="quest">
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">🔄 Core Loop</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">
          Seu progresso diário, semanal e de temporada aparece aqui em instantes.
        </Text>
      </GameCard>
    )
  }

  const activeStep = getActiveCoreLoopStep(coreLoop);

  return (
    <GameCard variant="quest">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">🔄 Core Loop</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">{getRetentionMessage(coreLoop)}</Text>
      <Text className="mt-2 text-xs font-semibold text-primary">{getD1Hook(coreLoop.daily.studiedToday, coreLoop.retention.currentStreak)}</Text>

      <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
        {CORE_LOOP_STEPS.map((step) => {
          const isActive = step.key === activeStep;
          return (
            <View key={step.key} className="w-[30%] items-center">
              <View
                className={cn(
                  'h-10 w-10 items-center justify-center rounded-full border',
                  isActive ? 'border-primary bg-primary/20' : 'border-border bg-surface',
                )}>
                <Text className="text-lg">{step.emoji}</Text>
              </View>
              <Text className={cn('mt-1 text-[10px] font-bold', isActive ? 'text-primary' : 'text-muted')}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="mt-4 gap-3">
        <View>
          <Text className="mb-1 text-xs text-muted">Diário · {coreLoop.daily.completed}/{coreLoop.daily.total}</Text>
          <ProgressBar
            value={coreLoop.daily.total > 0 ? (coreLoop.daily.completed / coreLoop.daily.total) * 100 : 0}
            variant="xp"
            height="sm"
            animated={false}
          />
        </View>
        <View>
          <Text className="mb-1 text-xs text-muted">Semanal · {coreLoop.weekly.completed}/{coreLoop.weekly.total}</Text>
          <ProgressBar
            value={coreLoop.weekly.total > 0 ? (coreLoop.weekly.completed / coreLoop.weekly.total) * 100 : 0}
            variant="xp"
            height="sm"
            animated={false}
          />
        </View>
        <View>
          <Text className="mb-1 text-xs text-muted">
            Temporada · Tier {coreLoop.monthly.seasonTier} · {coreLoop.monthly.daysLeft}d restantes
          </Text>
          <ProgressBar
            value={Math.min(100, Math.max(0, coreLoop.monthly.seasonPoints / 8))}
            variant="gold"
            height="sm"
            animated={false}
          />
        </View>
      </View>
    </GameCard>
  );
};
