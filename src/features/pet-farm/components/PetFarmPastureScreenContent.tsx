import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { formatBonusPercent } from '@/features/game-design/utils/bonus-percent-format';
import type { PetInstance } from '@/types/pet-instance';
import { cn } from '@/utils';

import { slotEfficiencyForFieldLevel } from '../catalogs/pet-farm-catalog';
import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PET_PASTURE_MAX_SLOTS, PET_PASTURE_UI } from '../constants/pet-pasture-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { PetFarmService } from '../services/pet-farm-service';
import { PetStatsService } from '../services/pet-stats-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import {
    PetFarmAlertCard,
    PetFarmCardHeader,
    PetFarmFeedback,
    PetFarmNavTile,
    PetFarmPrimaryCta,
    PetFarmSecondaryCta,
    PetFarmSectionHint,
    PetFarmStatPill,
} from './PetFarmUiKit';
import { PetGenBadge } from './PetGenBadge';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

export const PetFarmPastureScreenContent = () => {
  const router = useRouter();
  const instances = usePetFarmStore((s) => s.instances);
  const fields = usePetFarmStore((s) => s.fields);
  const bonuses = usePetFarmStore((s) => s.bonuses);
  const { load } = usePetFarmLoad();
  const [pickSlot, setPickSlot] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const activeSlotCount = fields.passive_pasture;
  const efficiencyPct = Math.round(slotEfficiencyForFieldLevel(activeSlotCount) * 100);
  const slottedCount = instances.filter((i) => i.passiveFieldSlot !== null).length;

  const pastureSlots = useMemo(() => {
    return Array.from({ length: PET_PASTURE_MAX_SLOTS }, (_, index) => {
      const locked = index >= activeSlotCount;
      const pet = instances.find((i) => i.passiveFieldSlot === index) ?? null;
      return { index, locked, pet };
    });
  }, [activeSlotCount, instances]);

  const openDetail = (instanceId: number) => {
    router.push(`${routes.petFarmInstance}/${instanceId}` as Href);
  };

  const handleRemove = async (instanceId: number) => {
    await PetFarmService.removeFromPassiveSlot(instanceId);
    setMessage(PET_FARM_UI.remove);
    await load();
  };

  const goBarnForSlot = (slot: number) => {
    router.push(`${routes.petFarmBarn}?assignSlot=${slot}` as Href);
    setPickSlot(null);
  };

  const bonusLines = useMemo(() => {
    const lines: { label: string; value: string; tone: 'primary' | 'amber' | 'emerald' | 'sky' }[] = [];
    if (bonuses.xp_boost > 0) {
      lines.push({ label: '⚡ XP', value: formatBonusPercent(bonuses.xp_boost), tone: 'primary' });
    }
    if (bonuses.coin_boost > 0) {
      lines.push({ label: '🪙 Moedas', value: formatBonusPercent(bonuses.coin_boost), tone: 'amber' });
    }
    if (bonuses.loot_luck > 0) {
      lines.push({ label: '🎁 Loot', value: formatBonusPercent(bonuses.loot_luck), tone: 'emerald' });
    }
    if (bonuses.shield_weekly > 0) {
      lines.push({
        label: '🛡️ Escudo/sem',
        value: `+${Math.round(bonuses.shield_weekly)}`,
        tone: 'sky',
      });
    }
    return lines;
  }, [bonuses]);

  return (
    <View className="gap-4 pb-6">
      {pickSlot !== null ? (
        <PetFarmAlertCard
          title={PET_PASTURE_UI.pickMode(pickSlot)}
          subtitle={PET_PASTURE_UI.pickGoBarn}>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <PetFarmPrimaryCta
                label={PET_PASTURE_UI.goBarn}
                onPress={() => goBarnForSlot(pickSlot)}
              />
            </View>
            <PressableScale
              onPress={() => setPickSlot(null)}
              className="justify-center rounded-2xl border border-border bg-surface px-4"
              accessibilityRole="button"
              accessibilityLabel={PET_PASTURE_UI.pickCancel}>
              <Text className="text-xs font-bold text-muted">{PET_PASTURE_UI.pickCancel}</Text>
            </PressableScale>
          </View>
        </PetFarmAlertCard>
      ) : null}

      <Card className="gap-3">
        <PetFarmCardHeader
          emoji="🌿"
          title={PET_PASTURE_UI.bonusTitle}
          badge={PET_PASTURE_UI.slotsUsed(slottedCount, activeSlotCount)}
        />
        <PetFarmSectionHint>{PET_PASTURE_UI.efficiency(efficiencyPct)}</PetFarmSectionHint>
        {bonusLines.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {bonusLines.map((line) => (
              <PetFarmStatPill key={line.label} label={line.label} value={line.value} tone={line.tone} />
            ))}
          </View>
        ) : (
          <View className="rounded-xl border border-dashed border-border bg-surface px-3 py-4">
            <Text className="text-center text-xs text-muted">
              {PetFarmService.formatBonusSummary(bonuses)}
            </Text>
          </View>
        )}
      </Card>

      <Card className="gap-3">
        <PetFarmCardHeader emoji="📍" title={PET_PASTURE_UI.slotsTitle} />
        <PetFarmSectionHint>Toque em um slot vazio para atribuir um pet do celeiro.</PetFarmSectionHint>
        <View className="flex-row flex-wrap gap-2.5">
          {pastureSlots.map(({ index, locked, pet }) => (
            <PastureSlotCard
              key={index}
              index={index}
              locked={locked}
              pet={pet}
              picking={pickSlot === index}
              onPressEmpty={() => !locked && setPickSlot(index)}
              onPressPet={() => pet && openDetail(pet.id)}
              onRemove={() => pet && void handleRemove(pet.id)}
            />
          ))}
        </View>
      </Card>

      <View className="gap-2">
        <PetFarmNavTile
          emoji="🏠"
          title={PET_PASTURE_UI.goBarn}
          subtitle="Ver todos os pets guardados"
          onPress={() => router.push(routes.petFarmBarn as Href)}
        />
        <PetFarmNavTile
          emoji="🥚"
          title={PET_PASTURE_UI.goIncubator}
          subtitle="Ovos em incubação e eclosão"
          onPress={() => router.push(routes.petFarmIncubator as Href)}
        />
      </View>

      <PetFarmSecondaryCta
        label={PET_PASTURE_UI.goUpgrades}
        onPress={() => router.push(routes.petFarmUpgrades as Href)}
      />

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};

const PastureSlotCard = ({
  index,
  locked,
  pet,
  picking,
  onPressEmpty,
  onPressPet,
  onRemove,
}: {
  index: number;
  locked: boolean;
  pet: PetInstance | null;
  picking: boolean;
  onPressEmpty: () => void;
  onPressPet: () => void;
  onRemove: () => void;
}) => {
  const passiveLabel = pet
    ? PetStatsService.formatPassiveLabel(pet.speciesKey, pet.stats)
    : null;

  const slotBadge = (
    <View className="absolute left-2 top-2 rounded-md bg-surface-elevated px-1.5 py-0.5">
      <Text className="text-[8px] font-bold text-muted">#{index + 1}</Text>
    </View>
  );

  if (locked) {
    return (
      <View className="h-[118px] w-[47%] min-w-[140px] items-center justify-center rounded-2xl border border-dashed border-border/50 bg-surface/40 opacity-70">
        {slotBadge}
        <Text className="text-2xl">🔒</Text>
        <Text className="mt-1.5 max-w-[120px] text-center text-[10px] font-medium text-muted">
          {PET_PASTURE_UI.lockedSlot}
        </Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <PressableScale
        onPress={onPressEmpty}
        className={cn(
          'h-[118px] w-[47%] min-w-[140px] items-center justify-center rounded-2xl border-2 border-dashed px-2',
          picking ? 'border-primary bg-primary/15' : 'border-border bg-surface',
        )}
        accessibilityRole="button"
        accessibilityLabel={PET_PASTURE_UI.emptySlot}>
        {slotBadge}
        <Text className="text-3xl">{picking ? '👆' : '🌿'}</Text>
        <Text className="mt-1.5 text-center text-[10px] font-bold text-foreground">
          {picking ? 'Escolhendo…' : PET_FARM_UI.emptySlot}
        </Text>
      </PressableScale>
    );
  }

  return (
    <View
      className={cn(
        'h-[118px] w-[47%] min-w-[140px] rounded-2xl border-2 border-primary/35 bg-primary/10 p-2.5',
        picking && 'border-primary',
      )}>
      {slotBadge}
      <PressableScale
        onPress={onPressPet}
        className="flex-1 items-center justify-center gap-0.5 pt-3"
        accessibilityRole="button"
        accessibilityLabel={pet.nickname}>
        <View className="flex-row items-center gap-1">
          <PetSpeciesIcon speciesKey={pet.speciesKey} size={32} />
          <PetGenderBadge gender={pet.gender} />
        </View>
        <Text className="text-[11px] font-bold text-foreground" numberOfLines={1}>
          {pet.nickname}
        </Text>
        {passiveLabel ? (
          <View className="rounded-full bg-primary/20 px-2 py-0.5">
            <Text className="text-[9px] font-bold text-primary" numberOfLines={1}>
              {passiveLabel}
            </Text>
          </View>
        ) : null}
        {pet.isActive ? (
          <Text className="text-[8px] font-bold text-primary">{PET_FARM_UI.activeCompanion}</Text>
        ) : null}
      </PressableScale>
      <PressableScale
        onPress={onRemove}
        className="absolute -right-0.5 -top-0.5 h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-elevated"
        accessibilityRole="button"
        accessibilityLabel={PET_PASTURE_UI.removeFromPasture}>
        <Text className="text-[10px] font-bold text-muted">✕</Text>
      </PressableScale>
      <View className="absolute bottom-2 right-2">
        <PetGenBadge generation={pet.generation} size="sm" />
      </View>
    </View>
  );
};
