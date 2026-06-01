import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { AchievementStatus, type AchievementViewModel } from '@/types/achievement';
import { cn } from '@/utils';

type AchievementCardProps = {
  achievement: AchievementViewModel;
};

const formatUnlockDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const isUnlocked = achievement.progress.status === AchievementStatus.UNLOCKED;
  const isLocked = achievement.progress.status === AchievementStatus.LOCKED;

  return (
    <GameCard
      variant={isUnlocked ? 'reward' : 'default'}
      className={cn('gap-3 p-4', isLocked && 'opacity-90')}>
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
          <Text className="text-2xl" accessibilityLabel={`Ícone da conquista ${achievement.name}`}>
            {isLocked ? '🔒' : achievement.icon}
          </Text>
        </View>

        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-base font-bold text-foreground" numberOfLines={2}>
            {achievement.name}
          </Text>
          {isUnlocked ? (
            <Text className="text-xs font-bold text-primary">✓ Desbloqueada</Text>
          ) : (
            <Text className="text-xs font-semibold text-accent">{achievement.progress.progressLabel}</Text>
          )}
        </View>
      </View>

      <Text className="text-sm leading-5 text-foreground-secondary">{achievement.description}</Text>

      {isUnlocked && achievement.unlockedAt ? (
        <Text className="text-xs text-muted">Conquistada em {formatUnlockDate(achievement.unlockedAt)}</Text>
      ) : (
        <View className="gap-1.5">
          <ProgressBar
            value={achievement.progress.current}
            max={achievement.progress.target}
            variant="xp"
            height="sm"
          />
        </View>
      )}

      {achievement.rewards.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase text-muted">Recompensas</Text>
          {achievement.rewards.map((reward) => (
            <View
              key={`${achievement.key}-${reward.label}`}
              className="flex-row items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <Text className="text-accent">✦</Text>
              <Text className="min-w-0 flex-1 text-sm text-foreground" numberOfLines={2}>
                {reward.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </GameCard>
  );
};
