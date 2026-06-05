import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components';
import { PetStage } from '@/types/pet';
import type { PetLeagueGhost, PetLeagueRewardTierValue, PetLeagueSeasonProgress } from '@/types/pet-league';

import {
    PET_LEAGUE_BATTLES_PER_PET_DAY,
    PET_LEAGUE_DIVISION_BY_KEY,
} from '../catalogs/pet-league-catalog';
import { PET_LEAGUE_UI } from '../constants/pet-league-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { getLeagueSeasonBounds, PetLeagueService } from '../services/pet-league-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import { PetFarmPetPicker } from './PetFarmPetPicker';
import {
    PetFarmAlertCard,
    PetFarmCardHeader,
    PetFarmEmptyState,
    PetFarmFeedback,
    PetFarmSectionHint,
    PetFarmStepRow,
} from './PetFarmUiKit';
import {
    buildGhostMatches,
    computeSeasonDayProgress,
    PetLeagueFighterPanel,
    PetLeagueGhostRow,
    PetLeagueRewardList,
    PetLeagueSeasonHero,
    resolveNextTierMeta,
} from './PetLeagueScreenParts';

type PetEntryView = {
  rating: number;
  winStreak: number;
  wins: number;
  losses: number;
  battlesLeft: number;
  divisionKey: string;
};

export const PetFarmLeagueScreenContent = () => {
  const instances = usePetFarmStore((s) => s.instances);
  const adventures = usePetFarmStore((s) => s.adventures);
  const academySessions = usePetFarmStore((s) => s.academySessions);
  const { load } = usePetFarmLoad();

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [ghosts, setGhosts] = useState<PetLeagueGhost[]>([]);
  const [progress, setProgress] = useState<PetLeagueSeasonProgress | null>(null);
  const [goldUnlocked, setGoldUnlocked] = useState(false);
  const [petEntry, setPetEntry] = useState<PetEntryView | null>(null);
  const [message, setMessage] = useState('');
  const [battling, setBattling] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const season = useMemo(() => getLeagueSeasonBounds(), []);
  const seasonDayProgress = useMemo(
    () => computeSeasonDayProgress(season.seasonStartIso, season.seasonEndIso),
    [season.seasonEndIso, season.seasonStartIso],
  );

  const busyInstanceIds = useMemo(() => {
    const ids = new Set<number>();
    for (const a of adventures) ids.add(a.instanceId);
    for (const s of academySessions) ids.add(s.instanceId);
    return ids;
  }, [adventures, academySessions]);

  const eligiblePets = useMemo(
    () =>
      instances.filter(
        (i) =>
          i.stage !== PetStage.EGG &&
          !busyInstanceIds.has(i.id) &&
          i.passiveFieldSlot === null &&
          i.breedingPenSlot === null,
      ),
    [instances, busyInstanceIds],
  );

  const selectedPet = eligiblePets.find((p) => p.id === selectedPetId) ?? eligiblePets[0] ?? null;

  useEffect(() => {
    if (selectedPet && selectedPetId !== selectedPet.id) {
      setSelectedPetId(selectedPet.id);
    }
  }, [selectedPet, selectedPetId]);

  const refreshMeta = useCallback(async () => {
    const [prog, gold] = await Promise.all([
      PetLeagueService.getSeasonProgress(),
      PetLeagueService.hasGoldUnlock(),
    ]);
    setProgress(prog);
    setGoldUnlocked(gold);
  }, []);

  const loadPetEntry = useCallback(
    async (petId: number) => {
      const pet = eligiblePets.find((p) => p.id === petId);
      if (!pet) {
        setPetEntry(null);
        return;
      }
      const entry = await PetLeagueService.getEntryForInstance(petId);
      const winStreak = entry?.winStreak ?? 0;
      const battlesToday = entry?.battlesToday ?? 0;
      setPetEntry({
        rating: PetLeagueService.getRatingPreview(pet, winStreak),
        winStreak,
        wins: entry?.wins ?? 0,
        losses: entry?.losses ?? 0,
        battlesLeft: Math.max(0, PET_LEAGUE_BATTLES_PER_PET_DAY - battlesToday),
        divisionKey: entry?.division ?? 'common',
      });
    },
    [eligiblePets],
  );

  const refreshGhosts = useCallback(async (petId: number) => {
    setGhosts(await PetLeagueService.getGhosts(petId));
  }, []);

  useEffect(() => {
    void refreshMeta();
  }, [refreshMeta]);

  useEffect(() => {
    if (!selectedPet) {
      setGhosts([]);
      setPetEntry(null);
      return;
    }
    void refreshGhosts(selectedPet.id);
    void loadPetEntry(selectedPet.id);
  }, [selectedPet?.id, refreshGhosts, loadPetEntry]);

  const ghostMatches = useMemo(() => {
    if (!petEntry) return [];
    return buildGhostMatches(ghosts, petEntry.rating);
  }, [ghosts, petEntry]);

  const nextTierMeta = useMemo(() => {
    if (!progress) {
      return {
        nextTierKey: null as PetLeagueRewardTierValue | null,
        nextTierLabel: null as string | null,
        nextTierProgress: 0,
        nextTierDetail: '',
      };
    }
    return resolveNextTierMeta(progress.totalWins, progress.peakRating, progress.claimedTiers);
  }, [progress]);

  const claimableCount = useMemo(() => {
    if (!progress) return 0;
    return progress.eligibleTiers.filter((t) => !progress.claimedTiers.includes(t)).length;
  }, [progress]);

  const stepFightActive = !!selectedPet && (petEntry?.battlesLeft ?? 0) > 0;
  const stepRewardsActive = claimableCount > 0;

  const handleBattle = async (ghostId: string) => {
    if (!selectedPet || battling) return;
    setBattling(true);
    setMessage('');

    const check = await PetLeagueService.canBattle(selectedPet.id);
    if (!check.ok) {
      setMessage(check.message);
      setBattling(false);
      return;
    }

    const result = await PetLeagueService.battle(selectedPet.id, ghostId);
    setBattling(false);

    if (!result) {
      setMessage('Não foi possível duelar.');
      return;
    }

    setMessage(
      result.won ? PET_LEAGUE_UI.winMessage(result.coinsEarned) : PET_LEAGUE_UI.lossMessage,
    );

    await Promise.all([refreshMeta(), refreshGhosts(selectedPet.id), loadPetEntry(selectedPet.id), load()]);
  };

  const handleClaim = async (tier: PetLeagueRewardTierValue) => {
    const res = await PetLeagueService.claimSeasonReward(tier);
    setMessage(res.message);
    await refreshMeta();
    await load();
  };

  const divisionDef = petEntry
    ? PET_LEAGUE_DIVISION_BY_KEY[petEntry.divisionKey as keyof typeof PET_LEAGUE_DIVISION_BY_KEY]
    : null;

  const battlesDisabled = battling || (petEntry?.battlesLeft ?? 0) <= 0;

  if (eligiblePets.length === 0) {
    return (
      <PetFarmEmptyState
        emoji="🏆"
        title="Nenhum pet disponível"
        subtitle="Libere pets do pasto, laboratório, aventuras ou academia para lutar."
      />
    );
  }

  return (
    <View className="gap-4 pb-8">
      {message ? <PetFarmFeedback message={message} /> : null}

      {claimableCount > 0 ? (
        <PetFarmAlertCard
          title={`${claimableCount} recompensa${claimableCount > 1 ? 's' : ''} pronta${claimableCount > 1 ? 's' : ''}!`}
          subtitle="Role até o fim ou toque em Ver recompensas.">
          <PetFarmSectionHint>{PET_LEAGUE_UI.rewardsHint}</PetFarmSectionHint>
        </PetFarmAlertCard>
      ) : null}

      <PetLeagueSeasonHero
        daysRemaining={season.daysRemaining}
        seasonDayProgress={seasonDayProgress}
        totalWins={progress?.totalWins ?? 0}
        peakRating={progress?.peakRating ?? 0}
        nextTierLabel={nextTierMeta.nextTierLabel}
        nextTierProgress={nextTierMeta.nextTierProgress}
        nextTierDetail={nextTierMeta.nextTierDetail}
        goldUnlocked={goldUnlocked}
      />

      <PetFarmStepRow
        steps={[
          { label: PET_LEAGUE_UI.stepPick, done: !!selectedPet, active: !selectedPet },
          { label: PET_LEAGUE_UI.stepFight, done: false, active: stepFightActive },
          { label: PET_LEAGUE_UI.stepRewards, done: false, active: stepRewardsActive },
        ]}
      />

      <Card className="gap-3">
        <PetFarmCardHeader emoji="⚔️" title={PET_LEAGUE_UI.fighterTitle} />
        <PetFarmSectionHint>{PET_LEAGUE_UI.fighterHint}</PetFarmSectionHint>

        {selectedPet && petEntry && divisionDef ? (
          <PetLeagueFighterPanel
            pet={selectedPet}
            divisionEmoji={divisionDef.emoji}
            divisionLabel={divisionDef.label}
            rating={petEntry.rating}
            wins={petEntry.wins}
            losses={petEntry.losses}
            winStreak={petEntry.winStreak}
            battlesLeft={petEntry.battlesLeft}
            battlesMax={PET_LEAGUE_BATTLES_PER_PET_DAY}
          />
        ) : null}

        <Pressable
          onPress={() => setShowPetPicker((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={showPetPicker ? 'Ocultar lista de pets' : PET_LEAGUE_UI.pickPet}>
          <Text className="text-[10px] font-bold text-primary">
            {showPetPicker ? '▲ Ocultar lista' : `▼ ${PET_LEAGUE_UI.pickPet}`}
          </Text>
        </Pressable>

        {showPetPicker ? (
          <PetFarmPetPicker
            pets={eligiblePets}
            selectedId={selectedPet?.id ?? null}
            onSelect={(id) => {
              setSelectedPetId(id);
              setMessage('');
              setShowPetPicker(false);
            }}
          />
        ) : null}
      </Card>

      <Card className="gap-3">
        <PetFarmCardHeader
          emoji="👻"
          title={PET_LEAGUE_UI.opponentsTitle}
          badge={ghostMatches.length > 0 ? String(ghostMatches.length) : undefined}
        />
        <PetFarmSectionHint>{PET_LEAGUE_UI.opponentsHint}</PetFarmSectionHint>

        {(petEntry?.battlesLeft ?? 0) <= 0 ? (
          <View className="rounded-xl border border-amber-500/30 bg-amber-950/15 px-3 py-2">
            <Text className="text-center text-xs text-amber-200">{PET_LEAGUE_UI.noBattlesLeft}</Text>
          </View>
        ) : null}

        {ghostMatches.length === 0 ? (
          <PetFarmEmptyState emoji="👻" title={PET_LEAGUE_UI.emptyOpponents} />
        ) : (
          ghostMatches.map((match) => (
            <PetLeagueGhostRow
              key={match.ghost.id}
              match={match}
              disabled={battlesDisabled}
              onBattle={() => void handleBattle(match.ghost.id)}
            />
          ))
        )}
      </Card>

      <Card className="gap-3">
        <PetFarmCardHeader
          emoji="🎁"
          title={PET_LEAGUE_UI.rewardsTitle}
          badge={claimableCount > 0 ? String(claimableCount) : undefined}
        />
        <Pressable
          onPress={() => setShowRewards((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={showRewards ? PET_LEAGUE_UI.rewardsToggleHide : PET_LEAGUE_UI.rewardsToggleShow}>
          <Text className="text-[10px] font-bold text-primary">
            {showRewards ? PET_LEAGUE_UI.rewardsToggleHide : PET_LEAGUE_UI.rewardsToggleShow}
          </Text>
        </Pressable>
        {showRewards && progress ? (
          <>
            <PetFarmSectionHint>{PET_LEAGUE_UI.rewardsHint}</PetFarmSectionHint>
            <PetLeagueRewardList
              eligibleTiers={progress.eligibleTiers}
              claimedTiers={progress.claimedTiers}
              nextTierKey={nextTierMeta.nextTierKey}
              onClaim={(tier) => void handleClaim(tier)}
            />
          </>
        ) : null}
      </Card>
    </View>
  );
};
