import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import type { AchievementSummary } from '@/types/achievement';

import { ACHIEVEMENTS_UI } from '../constants/achievements-ui';

type AchievementsHeroCardProps = {
  summary: AchievementSummary;
};

export const AchievementsHeroCard = ({ summary }: AchievementsHeroCardProps) => (
  <GameCard variant="hero" glow className="gap-4 p-4">
    <Text className="text-xs font-bold uppercase tracking-widest text-primary">
      🏆 {ACHIEVEMENTS_UI.heroTitle}
    </Text>

    <Text className="text-sm leading-5 text-foreground-secondary">{ACHIEVEMENTS_UI.heroSubtitle}</Text>

    <View className="flex-row items-end gap-4">
      <View className="min-w-0 flex-1">
        <Text className="text-3xl font-black text-foreground">
          {summary.unlocked}
          <Text className="text-lg font-medium text-foreground-secondary"> / {summary.total}</Text>
        </Text>
        <Text className="mt-1 text-sm text-foreground-secondary">{ACHIEVEMENTS_UI.unlockedLabel}</Text>
      </View>
      <View className="shrink-0 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
        <Text className="text-center text-xs font-bold text-muted">Progresso</Text>
        <Text className="text-center text-2xl font-black text-primary">{summary.percentage}%</Text>
      </View>
    </View>

    <View className="gap-1.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-semibold text-muted">Coleção completa</Text>
        <Text className="shrink-0 text-xs font-bold text-primary">
          {summary.unlocked} / {summary.total}
        </Text>
      </View>
      <ProgressBar value={summary.unlocked} max={summary.total || 1} variant="xp" height="sm" />
    </View>
  </GameCard>
);
