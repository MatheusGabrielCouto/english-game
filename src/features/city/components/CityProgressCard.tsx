import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { CITY_MESSAGES } from '@/features/city/constants/default-buildings';
import { TITLES_BY_KEY } from '@/features/titles/constants/default-titles';
import type { CityProgress } from '@/types/city';

type CityProgressCardProps = {
  progress: CityProgress;
};

export const CityProgressCard = ({ progress }: CityProgressCardProps) => {
  const { currentBuilding, nextBuilding, currentLevel, levelsUntilNext } = progress;
  const linkedTitle = TITLES_BY_KEY[currentBuilding.linkedTitleKey]?.name;
  const progressValue = nextBuilding
    ? Math.max(0, currentLevel - currentBuilding.requiredLevel)
    : 0;
  const progressMax = nextBuilding ? nextBuilding.requiredLevel - currentBuilding.requiredLevel : 1;
  const tierPercent =
    progressMax > 0 ? Math.min(100, Math.round((progressValue / progressMax) * 100)) : 100;

  if (!nextBuilding) {
    return (
      <GameCard variant="reward" glow>
        <Text className="text-xs font-bold uppercase tracking-widest text-gold">🏆 Cidade completa</Text>
        <Text className="mt-2 text-sm leading-5 text-foreground-secondary">{CITY_MESSAGES.nextMilestone}</Text>
        <View className="mt-4 flex-row items-center gap-3">
          <Text className="text-4xl">{currentBuilding.icon}</Text>
          <Text className="flex-1 text-lg font-black text-foreground">{currentBuilding.name}</Text>
        </View>
      </GameCard>
    );
  }

  const nextTitle = TITLES_BY_KEY[nextBuilding.linkedTitleKey]?.name;

  return (
    <GameCard variant="reward" glow>
      <Text className="text-xs font-bold uppercase tracking-widest text-gold">🎯 Próximo marco</Text>
      <View className="mt-3 flex-row items-center gap-3">
        <View className="rounded-2xl border border-gold/35 bg-gold/10 px-4 py-3">
          <Text className="text-4xl">{nextBuilding.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xl font-black text-foreground">{nextBuilding.name}</Text>
          <Text className="mt-1 text-sm leading-5 text-foreground-secondary">{nextBuilding.description}</Text>
          <Text className="mt-2 text-xs font-semibold text-gold">
            Desbloqueia no nível {nextBuilding.requiredLevel}
            {levelsUntilNext !== null ? ` · ${levelsUntilNext === 1 ? 'falta 1 nível' : `faltam ${levelsUntilNext} níveis`}` : ''}
          </Text>
          {nextTitle ? (
            <Text className="mt-1 text-[10px] text-muted">Recompensa: título {nextTitle}</Text>
          ) : null}
        </View>
      </View>

      <View className="mt-5 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase text-muted">Seu progresso</Text>
          <Text className="text-xs font-bold text-xp">Nv. {currentLevel}</Text>
        </View>
        <ProgressBar
          value={progressValue}
          max={progressMax || 1}
          variant="xp"
          height="md"
          showLabel
          label={`${tierPercent}% até ${nextBuilding.name}`}
        />
        {linkedTitle ? (
          <Text className="text-[10px] text-foreground-secondary">
            Marco atual: {currentBuilding.name} · título {linkedTitle}
          </Text>
        ) : null}
      </View>
    </GameCard>
  );
};
