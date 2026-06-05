import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import type { PetAcademyEntry } from '@/types/pet-academy';
import type { PetInstance } from '@/types/pet-instance';
import { cn } from '@/utils';

import type { PetAcademyTrackDef } from '../catalogs/pet-academy-catalog';
import { PET_ACADEMY_TRACK_BY_KEY } from '../catalogs/pet-academy-catalog';
import { PET_STAT_LABELS } from '../catalogs/pet-stat-rules';
import { PET_ACADEMY_UI } from '../constants/pet-academy-ui';
import { formatIdleTimeRemaining, idleSessionProgressPct } from '../utils/idle-session-time';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const SELECTED_SURFACE: ViewStyle = { backgroundColor: 'rgba(139, 92, 246, 0.14)' };
const READY_SURFACE: ViewStyle = { backgroundColor: 'rgba(245, 158, 11, 0.12)' };
const READY_BORDER = { borderColor: 'rgba(245, 158, 11, 0.45)' };

const formatTrackHours = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
};

type SessionRowProps = {
  session: PetAcademyEntry;
  pet: PetInstance | undefined;
  nowMs: number;
  onCollect: () => void;
};

export const PetAcademySessionRow = ({ session, pet, nowMs, onCollect }: SessionRowProps) => {
  const ready = new Date(session.endsAt).getTime() <= nowMs;
  const track = PET_ACADEMY_TRACK_BY_KEY[session.trackKey];
  const pct = idleSessionProgressPct(session.startedAt, session.endsAt, nowMs);
  const timeLabel = formatIdleTimeRemaining(session.endsAt, nowMs, PET_ACADEMY_UI.ready);

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
            {track?.emoji} {track?.label}
          </Text>
          <Text className={cn('text-[10px] font-bold', ready ? 'text-amber-300' : 'text-primary')}>
            {ready ? PET_ACADEMY_UI.ready : PET_ACADEMY_UI.returningIn(timeLabel)}
          </Text>
        </View>
        <Text className="text-2xl">{ready ? '🎓' : '📖'}</Text>
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
          accessibilityLabel={PET_ACADEMY_UI.collect}>
          <Text className="text-xs font-black text-background">{PET_ACADEMY_UI.collect}</Text>
        </Pressable>
      )}
    </View>
  );
};

type TrackGridProps = {
  tracks: PetAcademyTrackDef[];
  selectedKey: string;
  onSelect: (key: PetAcademyTrackDef['key']) => void;
};

export const PetAcademyTrackGrid = ({ tracks, selectedKey, onSelect }: TrackGridProps) => (
  <View className="gap-2">
    {tracks.map((track) => {
      const selected = selectedKey === track.key;
      const statLabel = PET_STAT_LABELS[track.statKey];
      return (
        <Pressable
          key={track.key}
          onPress={() => onSelect(track.key)}
          className={cn(
            'flex-row items-center gap-3 rounded-2xl border px-3 py-3',
            selected ? 'border-primary' : 'border-border bg-surface',
          )}
          style={selected ? SELECTED_SURFACE : undefined}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={track.label}>
          <Text className="text-2xl">{track.emoji}</Text>
          <View className="flex-1">
            <Text className="text-sm font-bold text-foreground">{track.label}</Text>
            <Text className="text-[10px] text-muted">{track.description}</Text>
            <Text className="mt-0.5 text-[9px] font-bold text-primary">
              {PET_ACADEMY_UI.durationLabel(formatTrackHours(track.minutes))} ·{' '}
              {PET_ACADEMY_UI.statFocus(statLabel)} · +{track.petXp} XP
            </Text>
          </View>
          {selected ? (
            <View className="rounded-full bg-primary px-2 py-0.5">
              <Text className="text-[8px] font-bold text-background">✓</Text>
            </View>
          ) : null}
        </Pressable>
      );
    })}
  </View>
);

type MissionPreviewProps = {
  track: PetAcademyTrackDef;
};

export const PetAcademyMissionPreview = ({ track }: MissionPreviewProps) => {
  const statLabel = PET_STAT_LABELS[track.statKey];
  return (
    <View className="gap-3 rounded-2xl border border-primary bg-surface p-3" style={SELECTED_SURFACE}>
      <Text className="text-[10px] font-bold uppercase tracking-widest text-primary">
        {PET_ACADEMY_UI.previewTitle}
      </Text>
      <View className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
        <Text className="text-3xl">{track.emoji}</Text>
        <View className="flex-1">
          <Text className="text-sm font-black text-foreground">{track.label}</Text>
          <Text className="text-[10px] text-muted">
            {PET_ACADEMY_UI.durationLabel(formatTrackHours(track.minutes))} · +{track.petXp} XP
          </Text>
          <Text className="text-[10px] font-bold text-primary">
            {PET_ACADEMY_UI.statFocus(statLabel)}
          </Text>
        </View>
      </View>
      <Text className="text-center text-[10px] text-muted">{PET_ACADEMY_UI.rewardsHint}</Text>
    </View>
  );
};
