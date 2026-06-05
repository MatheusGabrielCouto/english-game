import { Text, View } from 'react-native';

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
  const { overview, consistency } = dashboard;

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
        <HeroStat emoji="🔥" label="Streak" value={String(consistency.currentStreak)} tone="warning" />
        <HeroStat
          emoji="🪙"
          label="Moedas"
          value={formatNumber(overview.totalCoinsEarned)}
          tone="warning"
        />
      </View>
    </GameCard>
  );
};
