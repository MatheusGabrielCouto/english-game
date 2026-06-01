import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard, LevelBadge } from '@/components/ui/game';
import type { StatisticsDashboard } from '@/types/statistics';
import { cn } from '@/utils';

import { STATISTICS_UI } from '../constants/statistics-ui';
import { formatNumber } from '../utils/formatters';

type StatisticsHeroCardProps = {
  dashboard: StatisticsDashboard;
};

type HeroStatProps = {
  emoji: string;
  label: string;
  value: string;
  tone?: 'primary' | 'accent' | 'success' | 'warning';
};

const toneValue: Record<NonNullable<HeroStatProps['tone']>, string> = {
  primary: 'text-primary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
};

const HeroStat = ({ emoji, label, value, tone = 'primary' }: HeroStatProps) => (
  <View className="w-[48%] rounded-xl border border-border/80 bg-surface px-3 py-2.5">
    <Text className="text-xs text-foreground-secondary" numberOfLines={1}>
      {emoji} {label}
    </Text>
    <Text
      className={cn('mt-1 text-base font-black', toneValue[tone])}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}>
      {value}
    </Text>
  </View>
);

export const StatisticsHeroCard = ({ dashboard }: StatisticsHeroCardProps) => {
  const { overview, consistency, quests, achievements, city } = dashboard;
  const questAvg = Math.round((quests.dailyCompletionRate + quests.weeklyCompletionRate) / 2);

  return (
    <GameCard variant="hero" glow className="gap-4 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">
        📊 {STATISTICS_UI.heroTitle}
      </Text>

      <View className="flex-row items-center gap-3">
        <LevelBadge level={overview.currentLevel} size="md" />
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-black text-foreground" numberOfLines={2}>
            {overview.currentTitle}
          </Text>
          <Text className="mt-0.5 text-xs text-foreground-secondary" numberOfLines={2}>
            {overview.totalStudyTimeLabel} de estudo
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <HeroStat emoji="⚡" label="XP" value={formatNumber(overview.totalXp)} tone="primary" />
        <HeroStat emoji="📅" label="Dias" value={String(overview.totalStudyDays)} tone="accent" />
        <HeroStat
          emoji="🪙"
          label="Moedas"
          value={formatNumber(overview.totalCoinsEarned)}
          tone="warning"
        />
        <HeroStat emoji="🔥" label="Streak" value={String(consistency.currentStreak)} tone="warning" />
        <HeroStat emoji="🏆" label="Recorde" value={String(consistency.bestStreak)} tone="success" />
        <HeroStat emoji="🏗️" label="Cidade" value={`${city.progressPercentage}%`} tone="accent" />
      </View>

      <View className="gap-3">
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="shrink text-xs font-semibold text-muted">Missões (média)</Text>
            <Text className="shrink-0 text-xs font-bold text-xp">{questAvg}%</Text>
          </View>
          <ProgressBar value={questAvg} max={100} variant="xp" height="sm" />
        </View>
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="shrink text-xs font-semibold text-muted">Conquistas</Text>
            <Text className="shrink-0 text-xs font-bold text-gold">
              {achievements.unlocked}/{achievements.total}
            </Text>
          </View>
          <ProgressBar value={achievements.completionRate} max={100} variant="gold" height="sm" />
        </View>
      </View>
    </GameCard>
  );
};
