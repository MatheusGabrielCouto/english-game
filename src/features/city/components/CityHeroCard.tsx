import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard, GameDisplayText, LevelBadge, SharedHeroTransition } from '@/components/ui/game';
import { SHARED_TRANSITION_TAGS } from '@/constants';

import { usePunishmentStore } from '@/features/punishments/store/punishment-store';
import type { CityProgress, CitySummary } from '@/types/city';
import { CityHeroStats } from './CityHeroStats';

import { CITY_UI } from '../constants/city-ui';

type CityHeroCardProps = {
  level: number;
  summary: CitySummary;
  progress: CityProgress;
};

export const CityHeroCard = ({ level, summary, progress }: CityHeroCardProps) => {
  const cityVibrancy = usePunishmentStore((state) => state.aggregated.cityVibrancy);
  const completionPercent =
    summary.total > 0 ? Math.round((summary.unlocked / summary.total) * 100) : 0;

  return (
    <GameCard variant="hero" glow sharedTransitionTag={SHARED_TRANSITION_TAGS.cityHero}>
      <GameDisplayText variant="label">
        🏙️ {CITY_UI.heroTitle}
      </GameDisplayText>
      <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{CITY_UI.heroSubtitle}</Text>

      {cityVibrancy < 100 ? (
        <View className="mt-3 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2">
          <Text className="text-xs leading-5 text-warning">{CITY_UI.vibrancyWarning}</Text>
        </View>
      ) : null}

      <View className="mt-4 flex-row items-center gap-4">
        <LevelBadge level={level} size="lg" />
        <View className="flex-1">
          <GameDisplayText variant="section">{progress.currentBuilding.name}</GameDisplayText>
          <Text className="mt-0.5 text-xs text-foreground-secondary">
            Marco atual · Nv. {progress.currentBuilding.requiredLevel}
          </Text>
        </View>
        <SharedHeroTransition tag={SHARED_TRANSITION_TAGS.cityBuildingHero}>
          <Text className="text-4xl">{progress.currentBuilding.icon}</Text>
        </SharedHeroTransition>
      </View>

      <CityHeroStats
        unlocked={summary.unlocked}
        total={summary.total}
        completionPercent={completionPercent}
        levelsUntilNext={progress.levelsUntilNext}
      />

      <View className="mt-4">
        <Text className="mb-1 text-xs font-semibold uppercase text-muted">Expansão total</Text>
        <ProgressBar
          value={summary.unlocked}
          max={summary.total || 1}
          variant="gold"
          height="sm"
          showLabel
          label={`${completionPercent}% da cidade`}
        />
      </View>
    </GameCard>
  );
};
