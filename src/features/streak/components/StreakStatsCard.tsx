import { Text, View } from 'react-native';

import { Card } from '@/components';
import { AppIcon } from '@/components/ui/AppIcon';
import { theme } from '@/constants';
import { usePlayerStore } from '@/features/player';

const getStreakMessage = (currentStreak: number): string => {
  if (currentStreak === 0) return 'Estude hoje para iniciar sua sequência.';
  if (currentStreak === 1) return 'Ótimo começo! Volte amanhã para manter a sequência.';
  if (currentStreak < 7) return 'Você está construindo consistência. Continue assim!';
  if (currentStreak < 30) return 'Sequência sólida! Você está no caminho certo.';
  return 'Sequência impressionante! Você é imparável.';
};

export const StreakStatsCard = () => {
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const bestStreak = usePlayerStore((s) => s.bestStreak);
  const totalStudyDays = usePlayerStore((s) => s.totalStudyDays);
  const shields = usePlayerStore((s) => s.shields);

  return (
    <Card elevated accent>
      <View className="mb-4 flex-row items-center gap-3">
        <View className="rounded-xl bg-warning/15 p-3">
          <AppIcon name="flame" size={24} color={theme.colors.warning} />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-foreground-secondary">Sequência atual</Text>
          <Text className="text-3xl font-bold text-foreground">
            {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
          </Text>
        </View>
      </View>

      <Text className="mb-4 text-sm text-muted">{getStreakMessage(currentStreak)}</Text>

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Melhor sequência</Text>
          <Text className="mt-1 text-xl font-bold text-foreground">{bestStreak}</Text>
        </View>
        <View className="flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Dias estudados</Text>
          <Text className="mt-1 text-xl font-bold text-foreground">{totalStudyDays}</Text>
        </View>
        <View className="flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Escudos</Text>
          <Text className="mt-1 text-xl font-bold text-accent">{shields}</Text>
        </View>
      </View>
    </Card>
  );
};
