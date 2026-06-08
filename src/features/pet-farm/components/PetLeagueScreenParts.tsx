import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import type { PetInstance } from '@/types/pet-instance';
import type { PetLeagueGhost, PetLeagueRewardTierValue } from '@/types/pet-league';
import { cn } from '@/utils';

import {
    PET_LEAGUE_REWARD_BY_KEY,
    PET_LEAGUE_REWARD_TIERS,
} from '../catalogs/pet-league-catalog';
import { PET_LEAGUE_UI } from '../constants/pet-league-ui';
import {
    PetFarmCapacityBar,
    PetFarmStatPill,
} from './PetFarmUiKit';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const AMBER_SURFACE: ViewStyle = { backgroundColor: 'rgba(245, 158, 11, 0.12)' };
const GREEN_SURFACE: ViewStyle = { backgroundColor: 'rgba(34, 197, 94, 0.1)' };
const RED_SURFACE: ViewStyle = { backgroundColor: 'rgba(239, 68, 68, 0.08)' };
const RECOMMENDED_BORDER: ViewStyle = { borderColor: 'rgba(245, 158, 11, 0.55)' };

export type PetLeagueGhostMatch = {
  ghost: PetLeagueGhost;
  winChance: number;
  ratingDiff: number;
  recommended: boolean;
};

export const buildGhostMatches = (
  ghosts: PetLeagueGhost[],
  playerRating: number,
): PetLeagueGhostMatch[] => {
  const matches = ghosts.map((ghost) => {
    const ratingDiff = playerRating - ghost.rating;
    const edge = ratingDiff / 400;
    const winChance = Math.min(0.85, Math.max(0.25, 0.5 + edge));
    return { ghost, winChance, ratingDiff, recommended: false };
  });

  matches.sort((a, b) => b.winChance - a.winChance);
  if (matches[0]) matches[0].recommended = true;
  return matches;
};

type SeasonHeroProps = {
  daysRemaining: number;
  seasonDayProgress: number;
  totalWins: number;
  peakRating: number;
  nextTierLabel: string | null;
  nextTierProgress: number;
  nextTierDetail: string;
  goldUnlocked: boolean;
};

export const PetLeagueSeasonHero = ({
  daysRemaining,
  seasonDayProgress,
  totalWins,
  peakRating,
  nextTierLabel,
  nextTierProgress,
  nextTierDetail,
  goldUnlocked,
}: SeasonHeroProps) => (
  <View className="gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4">
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1 gap-1">
        <Text className="text-xs font-bold uppercase tracking-wide text-amber-400/90">
          {PET_LEAGUE_UI.seasonTitle}
        </Text>
        <Text className=" font-black text-foreground">
          {PET_LEAGUE_UI.daysLeft(daysRemaining)}
        </Text>
        <Text className="text-[10px] text-muted">{PET_LEAGUE_UI.resetsMonday}</Text>
      </View>
      <View className="rounded-xl bg-surface px-3 py-2" style={AMBER_SURFACE}>
        <Text className="text-[9px] font-bold uppercase text-muted">
          {PET_LEAGUE_UI.seasonProgress}
        </Text>
        <Text className="text-sm font-black text-amber-300">{Math.round(seasonDayProgress)}%</Text>
      </View>
    </View>

    <ProgressBar
      value={seasonDayProgress}
      max={100}
      height="sm"
      variant="gold"
      animated={false}
      accessibilityLabel={PET_LEAGUE_UI.seasonProgress}
    />

    <View className="flex-row flex-wrap gap-2">
      <PetFarmStatPill
        label={PET_LEAGUE_UI.accountWins}
        value={String(totalWins)}
        tone="amber"
      />
      <PetFarmStatPill
        label={PET_LEAGUE_UI.accountPeak}
        value={String(peakRating)}
        tone="emerald"
      />
    </View>

    <View className="gap-1.5 rounded-xl border border-border bg-surface/60 p-3">
      <Text className="text-[10px] font-bold text-muted">
        {nextTierLabel ? PET_LEAGUE_UI.nextTier : PET_LEAGUE_UI.nextTierDone}
      </Text>
      {nextTierLabel ? (
        <>
          <Text className="text-xs font-bold text-foreground">{nextTierLabel}</Text>
          <Text className="text-[10px] text-muted">{nextTierDetail}</Text>
          <ProgressBar
            value={nextTierProgress}
            max={100}
            height="sm"
            variant="xp"
            animated={false}
            accessibilityLabel={nextTierDetail}
          />
        </>
      ) : (
        <Text className="text-xs text-emerald-300">{PET_LEAGUE_UI.nextTierDone}</Text>
      )}
    </View>

    {goldUnlocked ? (
      <Text className="text-[10px] text-emerald-400">{PET_LEAGUE_UI.goldUnlockHint}</Text>
    ) : null}
  </View>
);

type FighterPanelProps = {
  pet: PetInstance;
  divisionEmoji: string;
  divisionLabel: string;
  rating: number;
  wins: number;
  losses: number;
  winStreak: number;
  battlesLeft: number;
  battlesMax: number;
};

export const PetLeagueFighterPanel = ({
  pet,
  divisionEmoji,
  divisionLabel,
  rating,
  wins,
  losses,
  winStreak,
  battlesLeft,
  battlesMax,
}: FighterPanelProps) => {
  const battlesUsed = battlesMax - battlesLeft;

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-3">
      <View className="flex-row items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
          <PetSpeciesIcon speciesKey={pet.speciesKey} size={44} />
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-1.5">
            <Text className="text-sm font-black text-foreground">{pet.nickname}</Text>
            <PetGenderBadge gender={pet.gender} />
          </View>
          <Text className="text-[10px] text-muted">
            {divisionEmoji} {divisionLabel}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <PetFarmStatPill label={PET_LEAGUE_UI.ratingLabel} value={String(rating)} tone="amber" />
        <PetFarmStatPill
          label={PET_LEAGUE_UI.recordLabel}
          value={PET_LEAGUE_UI.recordValue(wins, losses)}
          tone="sky"
        />
        <PetFarmStatPill
          label={PET_LEAGUE_UI.streakLabel}
          value={String(winStreak)}
          tone={winStreak >= 3 ? 'emerald' : 'default'}
        />
      </View>

      <PetFarmCapacityBar
        label={PET_LEAGUE_UI.battlesToday}
        used={battlesUsed}
        max={battlesMax}
      />
    </View>
  );
};

type GhostRowProps = {
  match: PetLeagueGhostMatch;
  disabled: boolean;
  onBattle: () => void;
};

export const PetLeagueGhostRow = ({ match, disabled, onBattle }: GhostRowProps) => {
  const { ghost, winChance, ratingDiff, recommended } = match;
  const pct = Math.round(winChance * 100);
  const favorable = pct >= 55;
  const tough = pct <= 45;

  return (
    <View
      className="gap-2.5 rounded-2xl border border-border bg-surface p-3"
      style={
        recommended
          ? { ...AMBER_SURFACE, ...RECOMMENDED_BORDER }
          : favorable
            ? GREEN_SURFACE
            : tough
              ? RED_SURFACE
              : undefined
      }>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated">
          <Text className="text-2xl">{ghost.emoji}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-sm font-bold text-foreground">{ghost.displayName}</Text>
            {recommended ? (
              <View className="rounded-full bg-amber-500/20 px-2 py-0.5">
                <Text className="text-[9px] font-bold text-amber-300">
                  {PET_LEAGUE_UI.recommended}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-[10px] text-muted">
            Nv. {ghost.level} · Rating {ghost.rating} · {PET_LEAGUE_UI.advantage(ratingDiff)}
          </Text>
        </View>
      </View>

      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-[10px] font-bold text-muted">
            {PET_LEAGUE_UI.chanceLabel(winChance)}
          </Text>
          <Text
            className={cn(
              'text-[10px] font-black',
              favorable ? 'text-emerald-300' : tough ? 'text-red-300' : 'text-foreground',
            )}>
            {pct}%
          </Text>
        </View>
        <ProgressBar
          value={pct}
          max={100}
          height="sm"
          variant={favorable ? 'xp' : tough ? 'streak' : 'default'}
          animated={false}
          accessibilityLabel={PET_LEAGUE_UI.chanceLabel(winChance)}
        />
      </View>

      <Pressable
        onPress={onBattle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${PET_LEAGUE_UI.battleCta} ${ghost.displayName}`}
        className="items-center rounded-xl bg-amber-600 py-2.5"
        style={{ opacity: disabled ? 0.45 : 1 }}>
        <Text className="text-xs font-black text-white">{PET_LEAGUE_UI.battleCta}</Text>
      </Pressable>
    </View>
  );
};

type RewardTierRowProps = {
  tier: PetLeagueRewardTierValue;
  eligible: boolean;
  claimed: boolean;
  isNext: boolean;
  onClaim: () => void;
};

export const PetLeagueRewardTierRow = ({
  tier,
  eligible,
  claimed,
  isNext,
  onClaim,
}: RewardTierRowProps) => {
  const def = PET_LEAGUE_REWARD_BY_KEY[tier];
  const status = claimed ? PET_LEAGUE_UI.claimed : eligible ? PET_LEAGUE_UI.claim : PET_LEAGUE_UI.locked;

  return (
    <View
      className={cn(
        'flex-row items-center gap-3 rounded-xl border border-border px-3 py-2.5',
        isNext && !claimed && 'border-primary/40 bg-primary/10',
        claimed && 'opacity-60',
      )}>
      <Text className="text-lg">{def.emoji}</Text>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs font-bold text-foreground">{def.label}</Text>
        <Text className="text-[10px] text-muted">
          {def.minWins}V ou {def.minPeakRating} rating · {def.coins}🪙 · {def.studyPoints} SP
        </Text>
      </View>
      <Pressable
        onPress={onClaim}
        disabled={claimed || !eligible}
        accessibilityRole="button"
        accessibilityLabel={`${status} ${def.label}`}
        className={cn(
          'rounded-lg border border-border px-2.5 py-1.5',
          eligible && !claimed && 'border-amber-500/50',
        )}
        style={eligible && !claimed ? AMBER_SURFACE : undefined}>
        <Text className="text-[10px] font-bold text-foreground">{status}</Text>
      </Pressable>
    </View>
  );
};

export const PetLeagueRewardList = ({
  eligibleTiers,
  claimedTiers,
  nextTierKey,
  onClaim,
}: {
  eligibleTiers: PetLeagueRewardTierValue[];
  claimedTiers: PetLeagueRewardTierValue[];
  nextTierKey: PetLeagueRewardTierValue | null;
  onClaim: (tier: PetLeagueRewardTierValue) => void;
}) => (
  <View className="gap-2">
    {PET_LEAGUE_REWARD_TIERS.map((t) => (
      <PetLeagueRewardTierRow
        key={t.key}
        tier={t.key}
        eligible={eligibleTiers.includes(t.key)}
        claimed={claimedTiers.includes(t.key)}
        isNext={t.key === nextTierKey}
        onClaim={() => onClaim(t.key)}
      />
    ))}
  </View>
);

export const resolveNextTierMeta = (
  totalWins: number,
  peakRating: number,
  claimedTiers: PetLeagueRewardTierValue[],
): {
  nextTierKey: PetLeagueRewardTierValue | null;
  nextTierLabel: string | null;
  nextTierProgress: number;
  nextTierDetail: string;
} => {
  const next = PET_LEAGUE_REWARD_TIERS.find((t) => !claimedTiers.includes(t.key));
  if (!next) {
    return {
      nextTierKey: null,
      nextTierLabel: null,
      nextTierProgress: 100,
      nextTierDetail: PET_LEAGUE_UI.nextTierDone,
    };
  }

  const winPct = Math.min(100, (totalWins / next.minWins) * 100);
  const ratingPct = Math.min(100, (peakRating / next.minPeakRating) * 100);
  const progress = Math.max(winPct, ratingPct);

  return {
    nextTierKey: next.key,
    nextTierLabel: `${next.emoji} ${next.label}`,
    nextTierProgress: progress,
    nextTierDetail: PET_LEAGUE_UI.nextTierProgress(
      progress >= winPct ? totalWins : peakRating,
      progress >= winPct ? next.minWins : next.minPeakRating,
      next.label,
    ),
  };
};

export const computeSeasonDayProgress = (seasonStartIso: string, seasonEndIso: string): number => {
  const now = Date.now();
  const start = new Date(seasonStartIso).getTime();
  const end = new Date(seasonEndIso).getTime();
  const total = end - start;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, ((now - start) / total) * 100));
};
