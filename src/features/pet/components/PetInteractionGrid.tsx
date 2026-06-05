import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { PetInteractionType, type PetInteractionTypeValue } from '@/types/pet-expansion';
import { cn } from '@/utils';

import { PET_INTERACTION_CATALOG } from '../constants/pet-interaction-catalog';
import { PET_UI } from '../constants/pet-ui';
import { DEFAULT_FOOD_KEY } from '../catalogs/pet-foods-catalog';
import { DEFAULT_TOY_KEY } from '../catalogs/pet-toys-catalog';
import { usePet } from '../hooks/use-pet';
import { PetInteractionService } from '../services/pet-interaction-service';
import { PetVitalsService } from '../services/pet-vitals-service';
import { usePetScreenStore } from '../store/pet-screen-store';
import { getPetRecommendedAction } from '../utils/get-pet-recommended-action';
import { formatInteractionCooldown, getInteractionCooldown } from '../utils/interaction-cooldown';
import { PetBestActionHighlight } from './PetBestActionHighlight';

type PetInteractionGridProps = {
  onInteraction?: (message: string) => void;
};

export const PetInteractionGrid = ({ onInteraction }: PetInteractionGridProps) => {
  const { pet } = usePet();
  const [busyType, setBusyType] = useState<PetInteractionTypeValue | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const setDialogue = usePetScreenStore((s) => s.setDialogueMessage);

  const cooldown = getInteractionCooldown(pet?.lastInteractionAt ?? null, nowMs);
  const cooldownLabel = formatInteractionCooldown(cooldown.remainingMs);

  const recommendedAction = useMemo(() => getPetRecommendedAction(pet), [pet]);

  const vitalBlocks = useMemo(() => {
    if (!pet) return {} as Partial<Record<PetInteractionTypeValue, string>>;
    return Object.fromEntries(
      PET_INTERACTION_CATALOG.map((item) => [
        item.type,
        PetVitalsService.getBlockMessage(pet, item.type),
      ]),
    ) as Partial<Record<PetInteractionTypeValue, string | null>>;
  }, [pet]);

  useEffect(() => {
    if (cooldown.canInteract) return;

    const interval = setInterval(() => setNowMs(Date.now()), 5_000);
    return () => clearInterval(interval);
  }, [cooldown.canInteract, cooldown.remainingMs]);

  const handlePress = useCallback(
    async (type: PetInteractionTypeValue) => {
      if (!pet || busyType !== null) return;

      if (!cooldown.canInteract) return;

      const vitalMessage = vitalBlocks[type];
      if (vitalMessage) {
        setDialogue(vitalMessage);
        return;
      }

      setBusyType(type);
      try {
        const result = await PetInteractionService.interact(type, {
          foodKey: DEFAULT_FOOD_KEY,
          toyKey: DEFAULT_TOY_KEY,
          cosmeticKey: type === PetInteractionType.ACCESSORY ? 'cosmetic_hat_1' : undefined,
        });
        setDialogue(result.message);
        onInteraction?.(result.message);
        setNowMs(Date.now());
      } finally {
        setBusyType(null);
      }
    },
    [busyType, cooldown.canInteract, onInteraction, pet, setDialogue, vitalBlocks],
  );

  if (!pet) return null;

  return (
    <Card elevated>
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <Text className="text-base font-semibold text-foreground">Interações</Text>
        {!cooldown.canInteract ? (
          <Text className="text-xs font-bold text-warning">⏳ {cooldownLabel}</Text>
        ) : (
          <Text className="text-xs text-muted">1x a cada 5 min</Text>
        )}
      </View>

      {!cooldown.canInteract ? (
        <Text className="mb-3 text-xs leading-relaxed text-foreground-secondary">
          Você já interagiu com seu pet. Volte em {cooldownLabel} para carinho, brincadeira ou treino.
        </Text>
      ) : null}

      {recommendedAction ? (
        <View className="mb-3">
          <PetBestActionHighlight action={recommendedAction} />
        </View>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        {PET_INTERACTION_CATALOG.map((item) => {
          const vitalBlocked = Boolean(vitalBlocks[item.type]);
          const cooldownBlocked = !cooldown.canInteract;
          const disabled = cooldownBlocked || vitalBlocked || busyType !== null;
          const isRecommended = recommendedAction?.type === item.type;

          return (
            <PressableScale
              key={item.type}
              onPress={() => void handlePress(item.type)}
              disabled={disabled && !vitalBlocked}
              accessibilityRole="button"
              accessibilityLabel={
                isRecommended ? `${item.label}. ${PET_UI.bestActionBadge}` : item.label
              }
              accessibilityState={{ disabled }}
              className="min-w-[22%] shrink-0 grow">
              <View
                className={cn(
                  'relative items-center rounded-2xl border px-2 py-3',
                  busyType === item.type
                    ? 'border-accent bg-accent/10'
                    : isRecommended
                      ? 'border-primary bg-primary/12'
                      : vitalBlocked
                        ? 'border-warning/40 bg-warning/5 opacity-80'
                        : cooldownBlocked
                          ? 'border-border bg-surface opacity-50'
                          : 'border-border bg-surface',
                )}>
                {isRecommended ? (
                  <View className="absolute -right-1 -top-1 rounded-full border border-primary/40 bg-primary px-1.5 py-0.5">
                    <Text className="text-[8px] font-bold uppercase text-primary-foreground">
                      {PET_UI.bestActionBadge}
                    </Text>
                  </View>
                ) : null}
                <Text className="text-2xl">{item.emoji}</Text>
                <Text className="mt-1 text-center text-xs font-semibold text-foreground">{item.label}</Text>
                {vitalBlocked ? (
                  <Text className="mt-0.5 text-center text-[9px] text-warning">Indisponível</Text>
                ) : null}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </Card>
  );
};
