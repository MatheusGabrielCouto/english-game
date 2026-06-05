import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { ProgressBar } from '@/components';
import { GameCard } from '@/components/ui/game';
import { PET_SPECIES_BY_KEY } from '@/features/game-design/catalogs/pet-species-catalog';
import type { Pet } from '@/types/pet';

import { PET_UI } from '../constants/pet-ui';
import { usePetIncubationClock } from '../hooks/use-pet-incubation-clock';
import { getPetDisplayInfo } from '../utils/display';
import { PetDialogueBubble } from './PetDialogueBubble';
import { PetXPBar } from './PetXPBar';

type PetIncubationLabProps = {
  pet: Pet;
};

type LabMetricProps = {
  emoji: string;
  label: string;
  value: string;
};

const LabMetric = ({ emoji, label, value }: LabMetricProps) => (
  <View className="min-w-0 flex-1 items-center rounded-xl border border-accent/20 bg-background/80 px-2 py-2.5">
    <Text className="text-lg">{emoji}</Text>
    <Text className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">{label}</Text>
    <Text className="mt-0.5 text-xs font-semibold text-accent">{value}</Text>
  </View>
);

export const PetIncubationLab = ({ pet }: PetIncubationLabProps) => {
  const clock = usePetIncubationClock(pet);
  const display = getPetDisplayInfo(pet);
  const species = PET_SPECIES_BY_KEY[pet.speciesKey] ?? PET_SPECIES_BY_KEY.codeowl;
  const pulse = useSharedValue(1);
  const scan = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    scan.value = withRepeat(withTiming(1, { duration: 2800, easing: Easing.linear }), -1, false);
  }, [pulse, scan]);

  const chamberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + scan.value * 0.45,
    transform: [{ translateY: -40 + scan.value * 80 }],
  }));

  return (
    <View className="gap-4">
      <GameCard
        variant="quest"
        glow
        className="overflow-hidden border-accent/35 bg-surface-elevated p-0">
        <View className="border-b border-accent/20 bg-accent/10 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-black uppercase tracking-widest text-accent">
              {PET_UI.labBadge}
            </Text>
            <View className="flex-row items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5">
              <View className="h-1.5 w-1.5 rounded-full bg-success" />
              <Text className="text-[10px] font-bold text-success">{PET_UI.labStatusStable}</Text>
            </View>
          </View>
        </View>

        <View className="px-4 py-6">
          <View className="mb-1 flex-row items-center justify-center gap-2">
            <Text className="text-base">🔬</Text>
            <Text className="text-xs font-bold uppercase tracking-wider text-muted">
              {PET_UI.labSpeciesLabel}
            </Text>
            <Text className="text-base">🧪</Text>
          </View>
          <Text className="text-center text-lg font-black text-foreground">
            {species.emoji} {species.name}
          </Text>
          <Text className="mt-0.5 text-center text-xs text-foreground-secondary">
            {display.name} · {species.passive.label}
          </Text>

          <View className="relative mt-8 items-center">
            <View className="absolute h-52 w-52 rounded-full border border-accent/10 bg-accent/5" />
            <View className="absolute h-44 w-44 rounded-full border border-dashed border-accent/25" />

            <Animated.View
              style={chamberStyle}
              className="h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-accent/50 bg-background/90">
              <Animated.View
                style={scanStyle}
                className="absolute left-0 right-0 h-10 bg-accent/25"
              />
              <Text className="text-6xl">🥚</Text>
              <Text className="absolute bottom-3 text-lg opacity-80">{species.emoji}</Text>
            </Animated.View>

            <View className="absolute -left-1 top-8 rounded-lg border border-border/80 bg-surface px-2 py-1">
              <Text className="text-sm">⚗️</Text>
            </View>
            <View className="absolute -right-1 top-10 rounded-lg border border-border/80 bg-surface px-2 py-1">
              <Text className="text-sm">💡</Text>
            </View>
            <View className="absolute bottom-2 rounded-lg border border-border/80 bg-surface px-2 py-1">
              <Text className="text-sm">📡</Text>
            </View>
          </View>

          <View className="mt-8 items-center">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {clock.isTimed ? PET_UI.labCountdownLabel : 'Evolução do ovo'}
            </Text>
            <Text className="mt-2 font-mono text-5xl font-black tabular-nums tracking-tight text-foreground">
              {clock.remainingMs <= 0 && clock.isTimed ? PET_UI.labHatchSoon : clock.displayTime}
            </Text>
            {clock.displaySubtime ? (
              <Text className="mt-1 font-mono text-sm tabular-nums text-muted">{clock.displaySubtime}</Text>
            ) : null}
          </View>

          <View className="mt-6">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-foreground-secondary">
                {PET_UI.labProgressLabel}
              </Text>
              <Text className="text-xs font-bold text-accent">{clock.progressPct}%</Text>
            </View>
            <ProgressBar
              value={clock.progressPct}
              max={100}
              variant="default"
              height="md"
              accessibilityLabel={`Progresso da incubação: ${clock.progressPct}%`}
            />
          </View>

          <View className="mt-5 flex-row gap-2">
            <LabMetric emoji="🌡️" label={PET_UI.labMetricTemp} value={PET_UI.labMetricTempValue} />
            <LabMetric emoji="💧" label={PET_UI.labMetricHumidity} value={PET_UI.labMetricHumidityValue} />
            <LabMetric emoji="⚡" label={PET_UI.labMetricEnergy} value={PET_UI.labMetricEnergyValue} />
          </View>
        </View>
      </GameCard>

      <PetDialogueBubble message={PET_UI.labDialogue} petName={pet.name} />

      <GameCard variant="default" className="border-accent/20 bg-surface px-4 py-3">
        <Text className="text-xs leading-5 text-foreground-secondary">
          {clock.isTimed ? PET_UI.labStudyHint : PET_UI.labEvolutionHint}
        </Text>
      </GameCard>

      <View className="rounded-2xl border border-border bg-surface px-4 py-3">
        <PetXPBar pet={pet} />
      </View>
    </View>
  );
};
