import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { useCityStore } from '@/features/city/store/city-store';
import { useContractsStore } from '@/features/contracts/store/contracts-store';
import { usePlayerStore } from '@/features/player';
import { useTitlesStore } from '@/features/titles/store/titles-store';

import { PROFILE_UI } from '../constants/profile-ui';
import { useWorldExplorationPercent } from '../hooks/use-explore-badges';

type HeroStatProps = {
  emoji: string;
  label: string;
  value: string;
};

const HeroStat = ({ emoji, label, value }: HeroStatProps) => (
  <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
    <Text className="text-lg">{emoji}</Text>
    <Text className="min-w-0 flex-1 text-sm text-foreground-secondary">{label}</Text>
    <Text className="shrink-0 text-sm font-black text-foreground">{value}</Text>
  </View>
);

export const ProfileExploreHero = () => {
  const level = usePlayerStore((s) => s.level);
  const explorationPct = useWorldExplorationPercent();
  const achievementSummary = useAchievementsStore((s) => s.summary);
  const citySummary = useCityStore((s) => s.summary);
  const titleSummary = useTitlesStore((s) => s.summary);
  const activeContract = useContractsStore((s) => s.activeContract);

  return (
    <GameCard variant="quest" className="gap-4 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">
        🗺️ {PROFILE_UI.exploreHeroTitle}
      </Text>

      <View className="flex-row items-center gap-4">
        <View className="min-w-0 flex-1">
          <Text className="text-3xl font-black text-foreground">{explorationPct}%</Text>
          <Text className="mt-1 text-sm text-foreground-secondary">{PROFILE_UI.exploreHeroSubtitle}</Text>
        </View>
        <View className="shrink-0 rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3">
          <Text className="text-center text-xs font-bold text-muted">Nível</Text>
          <Text className="text-center text-2xl font-black text-accent">{level}</Text>
        </View>
      </View>

      <View className="gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-xs font-semibold text-muted">Mapa do mundo</Text>
          <Text className="text-xs font-bold text-primary">{explorationPct}%</Text>
        </View>
        <ProgressBar value={explorationPct} max={100} variant="xp" height="sm" />
      </View>

      <View className="gap-2">
        <HeroStat
          emoji="🏆"
          label="Conquistas"
          value={`${achievementSummary.unlocked} / ${achievementSummary.total}`}
        />
        <HeroStat
          emoji="🏙️"
          label="Cidade"
          value={`${citySummary.unlocked} / ${citySummary.total}`}
        />
        <HeroStat
          emoji="👑"
          label="Títulos"
          value={`${titleSummary.unlocked} / ${titleSummary.total}`}
        />
      </View>

      {activeContract ? (
        <View className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-3">
          <Text className="text-xs font-bold uppercase text-primary">Missão ativa</Text>
          <Text className="mt-1 text-sm font-semibold leading-5 text-foreground" numberOfLines={2}>
            📜 {activeContract.name}
          </Text>
        </View>
      ) : (
        <Text className="text-center text-sm text-muted">{PROFILE_UI.exploreNoContract}</Text>
      )}
    </GameCard>
  );
};
