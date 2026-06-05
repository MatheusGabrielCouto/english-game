import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PetStage } from '@/types/pet';
import type { PetAdventureBiomeKey, PetAdventureDurationKey } from '@/types/pet-adventure';

import {
    PET_ADVENTURE_BIOME_BY_KEY,
    PET_ADVENTURE_BIOMES,
    PET_ADVENTURE_DURATION_BY_KEY,
    PET_ADVENTURE_DURATIONS,
} from '../catalogs/pet-adventures-catalog';
import { PET_ADVENTURES_UI } from '../constants/pet-adventures-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { PetAdventureService } from '../services/pet-adventure-service';
import { PetLeagueService } from '../services/pet-league-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import {
    PetAdventureBiomeGrid,
    PetAdventureCapacityRow,
    PetAdventureDurationPicker,
    PetAdventureExpeditionRow,
    PetAdventureMissionPreview,
} from './PetAdventureScreenParts';
import { PetFarmPetPicker } from './PetFarmPetPicker';
import {
    PetFarmAlertCard,
    PetFarmCardHeader,
    PetFarmEmptyState,
    PetFarmFeedback,
    PetFarmPrimaryCta,
    PetFarmSectionHint,
} from './PetFarmUiKit';

type SlotStatus = Awaited<ReturnType<typeof PetAdventureService.getSlotStatus>>;

export const PetFarmAdventuresScreenContent = () => {
  const instances = usePetFarmStore((s) => s.instances);
  const adventures = usePetFarmStore((s) => s.adventures);
  const { load } = usePetFarmLoad();

  const [slotStatus, setSlotStatus] = useState<SlotStatus | null>(null);
  const [leagueGoldUnlocked, setLeagueGoldUnlocked] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [biomeKey, setBiomeKey] = useState<PetAdventureBiomeKey>('meadow');
  const [durationKey, setDurationKey] = useState<PetAdventureDurationKey>('1h');
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  const refreshMeta = useCallback(async () => {
    const [slots, gold] = await Promise.all([
      PetAdventureService.getSlotStatus(),
      PetLeagueService.hasGoldUnlock(),
    ]);
    setSlotStatus(slots);
    setLeagueGoldUnlocked(gold);
  }, []);

  useEffect(() => {
    void refreshMeta();
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [refreshMeta, adventures.length]);

  const academySessions = usePetFarmStore((s) => s.academySessions);

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

  const readyAdventures = useMemo(
    () => adventures.filter((a) => new Date(a.endsAt).getTime() <= now),
    [adventures, now],
  );

  const shortDurations = useMemo(
    () => PET_ADVENTURE_DURATIONS.filter((d) => d.slotGroup === 'short'),
    [],
  );
  const longDurations = useMemo(
    () => PET_ADVENTURE_DURATIONS.filter((d) => d.slotGroup === 'long'),
    [],
  );

  const selectedBiome = PET_ADVENTURE_BIOME_BY_KEY[biomeKey];
  const selectedDuration = PET_ADVENTURE_DURATION_BY_KEY[durationKey];

  const successPct = selectedPet
    ? Math.round(PetAdventureService.getSuccessPreview(selectedPet, biomeKey) * 100)
    : 0;

  const handleCollectAll = async () => {
    const messages = await PetAdventureService.processReadyAdventures();
    setMessage(messages.length > 0 ? messages.join(' ') : 'Nada para coletar.');
    await load();
    await refreshMeta();
  };

  const handleCollectOne = async (adventureId: number) => {
    const result = await PetAdventureService.claimAdventure(adventureId);
    if (!result) {
      setMessage('Ainda em expedição.');
      return;
    }
    setMessage(
      `${result.flavor} +${result.coins} moedas, +${result.petXp} XP${
        result.studyPoints > 0 ? `, +${result.studyPoints} SP` : ''
      }${result.lootGranted ? ', loot!' : ''}`,
    );
    await load();
    await refreshMeta();
  };

  const handleStart = async () => {
    if (!selectedPet) {
      setMessage('Escolha um pet.');
      return;
    }
    const result = await PetAdventureService.startAdventure(
      selectedPet.id,
      biomeKey,
      durationKey,
      { leagueGoldUnlocked },
    );
    setMessage(result.message);
    if (result.ok) {
      await load();
      await refreshMeta();
    }
  };

  return (
    <View className="gap-4 pb-6">
      {slotStatus ? (
        <PetAdventureCapacityRow
          shortUsed={slotStatus.shortUsed}
          shortMax={slotStatus.shortMax}
          longUsed={slotStatus.longUsed}
          longMax={slotStatus.longMax}
          weekly24hUsed={slotStatus.weekly24hUsed}
          weekly24hCap={slotStatus.weekly24hCap}
        />
      ) : null}

      {readyAdventures.length > 0 ? (
        <PetFarmAlertCard
          title={`${readyAdventures.length} expedição${readyAdventures.length > 1 ? 'ões' : ''} pronta${readyAdventures.length > 1 ? 's' : ''}!`}
          subtitle="Seus pets voltaram com recompensas.">
          <PetFarmPrimaryCta
            label={`${PET_ADVENTURES_UI.collectAll} (${readyAdventures.length})`}
            onPress={() => void handleCollectAll()}
          />
        </PetFarmAlertCard>
      ) : null}

      <Card className="gap-3">
        <PetFarmCardHeader
          emoji="🎒"
          title={PET_ADVENTURES_UI.activeTitle}
          badge={adventures.length > 0 ? String(adventures.length) : undefined}
        />
        {adventures.length === 0 ? (
          <PetFarmEmptyState
            emoji="🧭"
            title={PET_ADVENTURES_UI.emptyActive}
            subtitle={PET_ADVENTURES_UI.emptyActiveHint}
          />
        ) : (
          <View className="gap-2.5">
            {adventures.map((adv) => (
              <PetAdventureExpeditionRow
                key={adv.id}
                adventure={adv}
                pet={instances.find((i) => i.id === adv.instanceId)}
                nowMs={now}
                onCollect={() => void handleCollectOne(adv.id)}
              />
            ))}
          </View>
        )}
      </Card>

      <Card className="gap-4">
        <PetFarmCardHeader emoji="✨" title={PET_ADVENTURES_UI.startTitle} />
        <PetFarmSectionHint>{PET_ADVENTURES_UI.pickPet}</PetFarmSectionHint>

        <PetFarmPetPicker
          pets={eligiblePets}
          selectedId={selectedPet?.id ?? null}
          onSelect={setSelectedPetId}
          emptyTitle="Nenhum pet disponível"
          emptySubtitle="Todos estão em expedição, academia, pasto ou são ovos."
        />

        <Text className="text-xs font-bold text-foreground">{PET_ADVENTURES_UI.pickBiome}</Text>
        <PetAdventureBiomeGrid
          biomes={PET_ADVENTURE_BIOMES}
          selectedKey={biomeKey}
          selectedPet={selectedPet}
          leagueGoldUnlocked={leagueGoldUnlocked}
          onSelect={setBiomeKey}
        />

        <Text className="text-xs font-bold text-foreground">{PET_ADVENTURES_UI.pickDuration}</Text>
        <PetAdventureDurationPicker
          shortDurations={shortDurations}
          longDurations={longDurations}
          selectedKey={durationKey}
          onSelect={setDurationKey}
        />

        {selectedPet && selectedBiome && selectedDuration ? (
          <PetAdventureMissionPreview
            biome={selectedBiome}
            duration={selectedDuration}
            successPct={successPct}
          />
        ) : null}

        <PetFarmPrimaryCta
          label={PET_ADVENTURES_UI.startCta}
          onPress={() => void handleStart()}
          disabled={!selectedPet}
        />
      </Card>

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};
