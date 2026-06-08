import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { TitleViewModel } from '@/types/title';
import { cn } from '@/utils';

type TitleHistoryCardProps = {
  title: TitleViewModel;
};

const formatUnlockDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const TitleHistoryCard = ({ title }: TitleHistoryCardProps) => {
  const isUnlocked = title.unlockedAt !== null;

  return (
    <GameCard
      variant={title.isActive ? 'quest' : isUnlocked ? 'reward' : 'default'}
      className={cn('gap-3 p-4', !isUnlocked && 'opacity-90')}>
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
          <Text className="text-2xl">{isUnlocked ? title.icon : '🔒'}</Text>
        </View>

        <View className="min-w-0 flex-1 gap-1">
          <Text className=" font-bold text-foreground" numberOfLines={2}>
            {title.name}
          </Text>
          {title.isActive ? (
            <Text className="text-xs font-bold text-primary">★ Título ativo</Text>
          ) : isUnlocked ? (
            <Text className="text-xs font-bold text-gold">✓ Desbloqueado</Text>
          ) : (
            <Text className="text-xs font-semibold text-muted">Nv. {title.requiredLevel} necessário</Text>
          )}
        </View>
      </View>

      <Text className="text-sm leading-5 text-foreground-secondary">{title.description}</Text>

      {isUnlocked && title.unlockedAt ? (
        <Text className="text-xs text-muted">Promovido em {formatUnlockDate(title.unlockedAt)}</Text>
      ) : (
        <Text className="text-xs text-foreground-secondary">Ainda não alcançado</Text>
      )}
    </GameCard>
  );
};
