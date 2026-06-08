import { Text, View } from 'react-native';

import { Card } from '@/components';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Pet } from '@/types/pet';

import { MOOD_CONFIG } from '../constants';
import { PET_VITAL_THRESHOLDS } from '../constants/vitals';
import { PetVitalsService } from '../services/pet-vitals-service';
import { getAffinityTier } from '../utils/affinity';
import { ROUTINE_LABELS, getRoutinePhase } from '../utils/routine';

type PetVitalsPanelProps = {
  pet: Pet;
};

const VitalRow = ({
  label,
  value,
  emoji,
  variant = 'default' as const,
  warning,
}: {
  label: string;
  value: number;
  emoji: string;
  variant?: 'default' | 'xp' | 'streak' | 'gold';
  warning?: boolean;
}) => (
  <View className="gap-1">
    <View className="flex-row items-center justify-between">
      <Text className="text-xs font-medium text-foreground-secondary">
        {emoji} {label}
      </Text>
      <Text className={`text-xs font-semibold ${warning ? 'text-warning' : 'text-foreground'}`}>
        {value}%
      </Text>
    </View>
    <ProgressBar value={value} max={100} variant={variant} height="sm" animated={false} />
  </View>
);

export const PetVitalsPanel = ({ pet }: PetVitalsPanelProps) => {
  const affinityTier = getAffinityTier(pet.affinity);
  const moodConfig = MOOD_CONFIG[pet.mood];
  const routine = ROUTINE_LABELS[getRoutinePhase()];
  const hungerLabel = PetVitalsService.getHungerLabel();
  const isLow = PetVitalsService.isLow(pet);
  const isCritical = PetVitalsService.isCriticallyLow(pet);

  return (
    <Card elevated className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className=" font-semibold text-foreground">Status</Text>
        <Text className="text-sm text-foreground-secondary">
          {routine.emoji} {routine.label} · {moodConfig.emoji} {moodConfig.label}
        </Text>
      </View>

      {isCritical ? (
        <Text className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          Seu pet precisa de comida e descanso. Alimente para recuperar energia.
        </Text>
      ) : isLow ? (
        <Text className="text-xs text-foreground-secondary">
          Vitais baixos reduzem afinidade ganha nas interações.
        </Text>
      ) : null}

      <VitalRow
        label="Energia"
        value={pet.energy}
        emoji="⚡"
        variant="gold"
        warning={pet.energy <= PET_VITAL_THRESHOLDS.LOW_WARNING}
      />
      <VitalRow
        label={hungerLabel}
        value={pet.hunger}
        emoji="🍽️"
        warning={pet.hunger <= PET_VITAL_THRESHOLDS.LOW_WARNING}
      />
      <VitalRow
        label="Felicidade"
        value={pet.happiness}
        emoji="😊"
        variant="xp"
        warning={pet.happiness <= PET_VITAL_THRESHOLDS.LOW_WARNING}
      />
      <VitalRow
        label="Motivação"
        value={pet.motivation}
        emoji="🎯"
        variant="streak"
        warning={pet.motivation <= PET_VITAL_THRESHOLDS.LOW_WARNING}
      />

      <View className="mt-1 rounded-xl border border-border bg-surface px-3 py-3">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-xs font-medium text-foreground-secondary">
            {affinityTier.emoji} Afinidade · {affinityTier.label}
          </Text>
          <Text className="text-xs font-bold text-accent">
            {pet.affinity}/{1000}
          </Text>
        </View>
        <ProgressBar value={pet.affinity} max={1000} variant="xp" height="sm" />
        <Text className="mt-2 text-xs text-muted">{affinityTier.bonusLabel}</Text>
      </View>
    </Card>
  );
};
