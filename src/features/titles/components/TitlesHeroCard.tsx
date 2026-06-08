import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { TITLE_MESSAGES } from '@/features/titles/constants/default-titles';
import type { TitleProgress, TitleSummary } from '@/types/title';

import { TITLES_UI } from '../constants/titles-ui';

type TitlesHeroCardProps = {
  progress: TitleProgress;
  summary: TitleSummary;
};

const StatRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
    <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">{label}</Text>
    <Text className="max-w-[55%] shrink-0 text-right text-sm font-black text-foreground" numberOfLines={2}>
      {value}
    </Text>
  </View>
);

export const TitlesHeroCard = ({ progress, summary }: TitlesHeroCardProps) => {
  const { currentTitle, nextTitle, currentLevel, levelsUntilNext } = progress;
  const progressValue = nextTitle ? Math.max(0, currentLevel - currentTitle.requiredLevel) : 0;
  const progressMax = nextTitle ? nextTitle.requiredLevel - currentTitle.requiredLevel : 1;
  const progressPct = progressMax > 0 ? Math.round((progressValue / progressMax) * 100) : 100;
  const collectionPct = summary.total > 0 ? Math.round((summary.unlocked / summary.total) * 100) : 0;

  return (
    <GameCard variant="hero" glow className="gap-4 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-primary">
        👑 {TITLES_UI.heroTitle}
      </Text>

      <Text className="text-sm leading-5 text-foreground-secondary">{TITLES_UI.heroSubtitle}</Text>

      <View className="flex-row items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-3">
        <Text className="text-3xl">{currentTitle.icon}</Text>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-xs font-bold uppercase text-primary">{TITLES_UI.currentLabel}</Text>
          <Text className="text-lg font-black text-foreground" numberOfLines={2}>
            {currentTitle.name}
          </Text>
          <Text className="text-sm leading-5 text-foreground-secondary" numberOfLines={3}>
            {currentTitle.description}
          </Text>
          <Text className="text-xs font-semibold text-accent">Nível {currentLevel}</Text>
        </View>
      </View>

      <View className="flex-row items-end gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-2xl font-black text-foreground">
            {summary.unlocked}
            <Text className=" font-medium text-foreground-secondary"> / {summary.total}</Text>
          </Text>
          <Text className="mt-0.5 text-xs text-muted">{TITLES_UI.collectionLabel}</Text>
        </View>
        <View className="shrink-0 rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2">
          <Text className="text-center text-[10px] font-bold text-muted">Coleção</Text>
          <Text className="text-center text-xl font-black text-gold">{collectionPct}%</Text>
        </View>
      </View>

      {nextTitle ? (
        <View className="gap-3">
          <StatRow label="Próximo título" value={nextTitle.name} />
          <StatRow
            label="Nível necessário"
            value={
              levelsUntilNext !== null
                ? `Nv. ${nextTitle.requiredLevel} · faltam ${levelsUntilNext}`
                : `Nv. ${nextTitle.requiredLevel}`
            }
          />
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="shrink text-xs font-semibold text-muted">{TITLES_UI.nextLabel}</Text>
              <Text className="shrink-0 text-xs font-bold text-primary">{progressPct}%</Text>
            </View>
            <ProgressBar value={progressValue} max={progressMax || 1} variant="xp" height="sm" />
          </View>
        </View>
      ) : (
        <Text className="text-sm leading-5 text-foreground-secondary">{TITLE_MESSAGES.nextMilestone}</Text>
      )}
    </GameCard>
  );
};
