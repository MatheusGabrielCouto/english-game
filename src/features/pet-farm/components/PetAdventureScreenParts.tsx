import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { Card } from '@/components';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { PetAdventureEntry } from '@/types/pet-adventure';
import type { PetInstance } from '@/types/pet-instance';
import { cn } from '@/utils';

import type { PetAdventureBiomeDef, PetAdventureDurationDef } from '../catalogs/pet-adventures-catalog';
import {
    isBiomeUnlocked,
    PET_ADVENTURE_BIOME_BY_KEY,
    PET_ADVENTURE_DURATION_BY_KEY,
} from '../catalogs/pet-adventures-catalog';
import { PET_ADVENTURES_UI } from '../constants/pet-adventures-ui';
import {
    PetFarmCardHeader,
    PetFarmStatPill,
} from './PetFarmUiKit';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const SELECTED_SURFACE: ViewStyle = { backgroundColor: 'rgba(139, 92, 246, 0.14)' };
const READY_SURFACE: ViewStyle = { backgroundColor: 'rgba(245, 158, 11, 0.12)' };
const READY_BORDER = { borderColor: 'rgba(245, 158, 11, 0.45)' };

export const formatTimeRemaining = (endsAt: string, nowMs: number): string => {
  const diff = new Date(endsAt).getTime() - nowMs;
  if (diff <= 0) return PET_ADVENTURES_UI.ready;
  const mins = Math.ceil(diff / 60_000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
  }
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const expeditionProgressPct = (startedAt: string, endsAt: string, nowMs: number): number => {
  const start = new Date(startedAt).getTime();
  const end = new Date(endsAt).getTime();
  const total = end - start;
  if (total <= 0) return 100;
  const elapsed = nowMs - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

const rewardLabelForBiome = (biome: PetAdventureBiomeDef, duration: PetAdventureDurationDef): string => {
  const coins = PET_ADVENTURES_UI.rewardCoins(duration.coinsMin, duration.coinsMax);
  const xp = PET_ADVENTURES_UI.rewardXp(duration.petXp);
  if (biome.primaryReward === 'sp') {
    return `${coins} · ${xp} · SP`;
  }
  if (biome.primaryReward === 'loot' || duration.lootOnSuccess) {
    return `${coins} · ${xp} · ${PET_ADVENTURES_UI.rewardLoot}`;
  }
  return `${coins} · ${xp}`;
};

type CapacityProps = {
  shortUsed: number;
  shortMax: number;
  longUsed: number;
  longMax: number;
  weekly24hUsed: number;
  weekly24hCap: number;
};

export const PetAdventureCapacityRow = ({
  shortUsed,
  shortMax,
  longUsed,
  longMax,
  weekly24hUsed,
  weekly24hCap,
}: CapacityProps) => (
  <Card className="gap-3">
    <PetFarmCardHeader emoji="🗺️" title={PET_ADVENTURES_UI.capacityTitle} />
    <View className="flex-row flex-wrap gap-2">
      <PetFarmStatPill
        label={PET_ADVENTURES_UI.slotsShortLabel}
        value={`${shortUsed}/${shortMax}`}
        tone={shortUsed >= shortMax ? 'amber' : 'sky'}
      />
      <PetFarmStatPill
        label={PET_ADVENTURES_UI.slotsLongLabel}
        value={`${longUsed}/${longMax}`}
        tone={longUsed >= longMax ? 'amber' : 'emerald'}
      />
      <PetFarmStatPill
        label={PET_ADVENTURES_UI.weekly24hLabel}
        value={`${weekly24hUsed}/${weekly24hCap}`}
        tone={weekly24hUsed >= weekly24hCap ? 'amber' : 'violet'}
      />
    </View>
  </Card>
);

type ExpeditionRowProps = {
  adventure: PetAdventureEntry;
  pet: PetInstance | undefined;
  nowMs: number;
  onCollect: () => void;
};

export const PetAdventureExpeditionRow = ({
  adventure,
  pet,
  nowMs,
  onCollect,
}: ExpeditionRowProps) => {
  const ready = new Date(adventure.endsAt).getTime() <= nowMs;
  const biome = PET_ADVENTURE_BIOME_BY_KEY[adventure.biomeKey];
  const duration = PET_ADVENTURE_DURATION_BY_KEY[adventure.durationKey];
  const pct = expeditionProgressPct(adventure.startedAt, adventure.endsAt, nowMs);
  const timeLabel = formatTimeRemaining(adventure.endsAt, nowMs);

  return (
    <View
      className="gap-2.5 rounded-2xl border border-border bg-surface p-3"
      style={ready ? { ...READY_SURFACE, ...READY_BORDER } : undefined}>
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated"
          style={ready ? READY_SURFACE : undefined}>
          {pet ? (
            <PetSpeciesIcon speciesKey={pet.speciesKey} size={38} />
          ) : (
            <Text className="text-2xl">🐾</Text>
          )}
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="text-sm font-bold text-foreground">{pet?.nickname ?? 'Pet'}</Text>
            {pet ? <PetGenderBadge gender={pet.gender} /> : null}
          </View>
          <Text className="text-[10px] text-muted">
            {biome?.emoji} {biome?.label} · {duration?.label ?? adventure.durationKey}
          </Text>
          <Text className={cn('text-[10px] font-bold', ready ? 'text-amber-300' : 'text-primary')}>
            {ready ? PET_ADVENTURES_UI.ready : PET_ADVENTURES_UI.returningIn(timeLabel)}
          </Text>
        </View>
        <Text className="text-2xl">{ready ? '✨' : '🚶'}</Text>
      </View>
      {!ready ? (
        <ProgressBar
          value={pct}
          max={100}
          height="sm"
          variant="xp"
          animated={false}
          accessibilityLabel={`Progresso ${Math.round(pct)}%`}
        />
      ) : (
        <Pressable
          onPress={onCollect}
          className="items-center rounded-xl bg-primary py-2.5"
          accessibilityRole="button"
          accessibilityLabel={PET_ADVENTURES_UI.collect}>
          <Text className="text-xs font-black text-background">{PET_ADVENTURES_UI.collect}</Text>
        </Pressable>
      )}
    </View>
  );
};

type MissionPreviewProps = {
  biome: PetAdventureBiomeDef;
  duration: PetAdventureDurationDef;
  successPct: number;
};

export const PetAdventureMissionPreview = ({
  biome,
  duration,
  successPct,
}: MissionPreviewProps) => (
  <View className="gap-3 rounded-2xl border border-primary bg-surface p-3" style={SELECTED_SURFACE}>
    <Text className="text-[10px] font-bold uppercase tracking-widest text-primary">
      {PET_ADVENTURES_UI.previewTitle}
    </Text>
    <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <Text className="text-3xl">{biome.emoji}</Text>
      <View className="flex-1">
        <Text className="text-sm font-black text-foreground">{biome.label}</Text>
        <Text className="text-[10px] text-muted">{duration.label} de expedição</Text>
      </View>
    </View>
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-3 py-2">
      <Text className="text-[10px] text-muted">{duration.label}</Text>
      <Text className="text-[10px] font-bold text-foreground">
        {rewardLabelForBiome(biome, duration)}
      </Text>
    </View>
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-bold text-muted">{PET_ADVENTURES_UI.successChance}</Text>
        <Text className="text-sm font-black text-primary">{successPct}%</Text>
      </View>
      <ProgressBar
        value={successPct}
        max={100}
        height="sm"
        variant="xp"
        animated={false}
        accessibilityLabel={`${PET_ADVENTURES_UI.successChance} ${successPct}%`}
      />
    </View>
  </View>
);

type BiomeGridProps = {
  biomes: PetAdventureBiomeDef[];
  selectedKey: string;
  selectedPet: PetInstance | null;
  leagueGoldUnlocked: boolean;
  onSelect: (key: PetAdventureBiomeDef['key']) => void;
};

export const PetAdventureBiomeGrid = ({
  biomes,
  selectedKey,
  selectedPet,
  leagueGoldUnlocked,
  onSelect,
}: BiomeGridProps) => (
  <View className="flex-row flex-wrap gap-2">
    {biomes.map((biome) => {
      const unlock = selectedPet
        ? isBiomeUnlocked(selectedPet, biome, leagueGoldUnlocked)
        : { ok: false as const };
      const selected = selectedKey === biome.key;
      return (
        <Pressable
          key={biome.key}
          onPress={() => unlock.ok && onSelect(biome.key)}
          disabled={!unlock.ok}
          className={cn(
            'w-[47%] min-w-[140px] gap-1 rounded-2xl border px-3 py-3',
            selected ? 'border-primary' : 'border-border bg-surface',
            !unlock.ok && 'opacity-50',
          )}
          style={selected ? SELECTED_SURFACE : undefined}
          accessibilityRole="button"
          accessibilityState={{ selected, disabled: !unlock.ok }}
          accessibilityLabel={biome.label}>
          <Text className="text-2xl">{biome.emoji}</Text>
          <Text className="text-xs font-bold text-foreground">{biome.label}</Text>
          <Text className="text-[9px] leading-snug text-muted" numberOfLines={2}>
            {unlock.ok ? biome.description : unlock.reason ?? PET_ADVENTURES_UI.locked}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

type DurationPickerProps = {
  shortDurations: PetAdventureDurationDef[];
  longDurations: PetAdventureDurationDef[];
  selectedKey: string;
  onSelect: (key: PetAdventureDurationDef['key']) => void;
};

const DurationChip = ({
  duration,
  selected,
  onPress,
}: {
  duration: PetAdventureDurationDef;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      'rounded-xl border px-3 py-2.5',
      selected ? 'border-primary' : 'border-border bg-surface',
    )}
    style={selected ? SELECTED_SURFACE : undefined}
    accessibilityRole="button"
    accessibilityState={{ selected }}>
    <Text className={cn('text-[11px] font-bold', selected ? 'text-primary' : 'text-foreground')}>
      {duration.label}
    </Text>
    <Text className="text-[8px] text-muted">
      {PET_ADVENTURES_UI.rewardCoins(duration.coinsMin, duration.coinsMax)}
    </Text>
  </Pressable>
);

export const PetAdventureDurationPicker = ({
  shortDurations,
  longDurations,
  selectedKey,
  onSelect,
}: DurationPickerProps) => (
  <View className="gap-3">
    <View className="gap-2">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-muted">
        {PET_ADVENTURES_UI.durationShort}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {shortDurations.map((d) => (
          <DurationChip
            key={d.key}
            duration={d}
            selected={selectedKey === d.key}
            onPress={() => onSelect(d.key)}
          />
        ))}
      </View>
    </View>
    <View className="gap-2">
      <Text className="text-[10px] font-bold uppercase tracking-wide text-muted">
        {PET_ADVENTURES_UI.durationLong}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {longDurations.map((d) => (
          <DurationChip
            key={d.key}
            duration={d}
            selected={selectedKey === d.key}
            onPress={() => onSelect(d.key)}
          />
        ))}
      </View>
    </View>
  </View>
);
