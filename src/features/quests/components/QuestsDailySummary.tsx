import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard, StatPill } from '@/components/ui/game';
import { getTodayKey } from '@/features/quests/utils/date';
import type { Mission } from '@/types/mission';

type QuestsDailySummaryProps = {
  missions: Mission[];
};

const formatTodayLabel = (): string => {
  const today = getTodayKey();
  const date = new Date(`${today}T12:00:00`);
  const label = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const QuestsDailySummary = ({ missions }: QuestsDailySummaryProps) => {
  const completedCount = missions.filter((mission) => mission.completed).length;
  const totalCount = missions.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const earnedXp = missions
    .filter((mission) => mission.completed)
    .reduce((sum, mission) => sum + mission.xpReward, 0);
  const earnedCoins = missions
    .filter((mission) => mission.completed)
    .reduce((sum, mission) => sum + mission.coinReward, 0);
  const pendingXp = missions
    .filter((mission) => !mission.completed)
    .reduce((sum, mission) => sum + mission.xpReward, 0);
  const pendingCoins = missions
    .filter((mission) => !mission.completed)
    .reduce((sum, mission) => sum + mission.coinReward, 0);

  return (
    <GameCard variant={allCompleted ? 'reward' : 'quest'} glow className="overflow-hidden">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-accent">
            {allCompleted ? '🏆 Dia completo' : '⚔️ Missões de hoje'}
          </Text>
          <Text className="mt-1 text-3xl font-black text-foreground">
            {completedCount}/{totalCount}
          </Text>
          <Text className="mt-0.5 text-xs capitalize text-muted">{formatTodayLabel()}</Text>
        </View>
        <Text className="text-4xl">{allCompleted ? '🎉' : '🎯'}</Text>
      </View>

      <Text className="mt-3 text-sm leading-5 text-foreground-secondary">
        {allCompleted
          ? 'Incrível! Você garantiu todas as recompensas diárias. Volte amanhã por novas missões.'
          : 'Toque em uma missão para marcar como concluída e receber XP + moedas.'}
      </Text>

      <View className="mt-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase text-foreground-secondary">Progresso</Text>
          <Text className="text-xs font-bold text-xp">{progress}%</Text>
        </View>
        <ProgressBar value={progress} variant={allCompleted ? 'gold' : 'xp'} height="lg" animated={false} />
      </View>

      <View className="mt-4 gap-2">
        <View className="flex-row gap-2">
          <StatPill emoji="⚡" label="XP ganho" value={earnedXp} tone="accent" className="flex-1" />
          <StatPill emoji="🪙" label="Moedas" value={earnedCoins} tone="warning" className="flex-1" />
        </View>

        {!allCompleted && (pendingXp > 0 || pendingCoins > 0) ? (
          <View className="flex-row gap-2">
            {pendingXp > 0 ? (
              <StatPill
                emoji="✨"
                label="XP restante"
                value={`+${pendingXp}`}
                tone="primary"
                className="flex-1"
              />
            ) : null}
            {pendingCoins > 0 ? (
              <StatPill
                emoji="💰"
                label="Moedas rest."
                value={`+${pendingCoins}`}
                tone="gold"
                className="flex-1"
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </GameCard>
  );
};
