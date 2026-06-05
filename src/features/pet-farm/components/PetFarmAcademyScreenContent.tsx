import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components';
import { PetStage } from '@/types/pet';
import type { PetAcademyTrackKey } from '@/types/pet-academy';

import {
    PET_ACADEMY_TRACK_BY_KEY,
    PET_ACADEMY_TRACKS,
} from '../catalogs/pet-academy-catalog';
import { PET_ACADEMY_UI } from '../constants/pet-academy-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { PetAcademyService } from '../services/pet-academy-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import {
    PetAcademyMissionPreview,
    PetAcademySessionRow,
    PetAcademyTrackGrid,
} from './PetAcademyScreenParts';
import { PetFarmPetPicker } from './PetFarmPetPicker';
import {
    PetFarmAlertCard,
    PetFarmCardHeader,
    PetFarmEmptyState,
    PetFarmFeedback,
    PetFarmPrimaryCta,
    PetFarmSectionHint,
    PetFarmStatPill,
} from './PetFarmUiKit';

export const PetFarmAcademyScreenContent = () => {
  const instances = usePetFarmStore((s) => s.instances);
  const academySessions = usePetFarmStore((s) => s.academySessions);
  const { load } = usePetFarmLoad();

  const [capacity, setCapacity] = useState<{ used: number; max: number } | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [trackKey, setTrackKey] = useState<PetAcademyTrackKey>('vocabulary');
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  const refreshMeta = useCallback(async () => {
    setCapacity(await PetAcademyService.getCapacity());
  }, []);

  useEffect(() => {
    void refreshMeta();
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, [refreshMeta, academySessions.length]);

  const adventures = usePetFarmStore((s) => s.adventures);

  const busyInstanceIds = useMemo(
    () => new Set(academySessions.map((s) => s.instanceId)),
    [academySessions],
  );

  const adventureInstanceIds = useMemo(
    () => new Set(adventures.map((a) => a.instanceId)),
    [adventures],
  );

  const eligiblePets = useMemo(
    () =>
      instances.filter(
        (i) =>
          i.stage !== PetStage.EGG &&
          !busyInstanceIds.has(i.id) &&
          !adventureInstanceIds.has(i.id) &&
          i.passiveFieldSlot === null &&
          i.breedingPenSlot === null,
      ),
    [instances, busyInstanceIds, adventureInstanceIds],
  );

  const selectedPet = eligiblePets.find((p) => p.id === selectedPetId) ?? eligiblePets[0] ?? null;
  const selectedTrack = PET_ACADEMY_TRACK_BY_KEY[trackKey];

  useEffect(() => {
    if (selectedPet && selectedPetId !== selectedPet.id) {
      setSelectedPetId(selectedPet.id);
    }
  }, [selectedPet, selectedPetId]);

  const readySessions = useMemo(
    () => academySessions.filter((s) => new Date(s.endsAt).getTime() <= now),
    [academySessions, now],
  );

  const handleCollectAll = async () => {
    const messages = await PetAcademyService.processReadySessions();
    setMessage(messages.length > 0 ? messages.join(' ') : 'Nada para coletar.');
    await load();
    await refreshMeta();
  };

  const handleCollectOne = async (sessionId: number) => {
    const result = await PetAcademyService.claimSession(sessionId);
    if (!result) {
      setMessage('Aula ainda em andamento.');
      return;
    }
    setMessage(`${result.flavor} +${result.petXp} XP`);
    await load();
    await refreshMeta();
  };

  const handleStart = async () => {
    if (!selectedPet) {
      setMessage('Escolha um pet.');
      return;
    }
    const result = await PetAcademyService.startSession(selectedPet.id, trackKey);
    setMessage(result.message);
    if (result.ok) {
      await load();
      await refreshMeta();
    }
  };

  return (
    <View className="gap-4 pb-6">
      {capacity ? (
        <Card className="gap-3">
          <PetFarmCardHeader emoji="🎓" title={PET_ACADEMY_UI.capacityTitle} />
          <PetFarmStatPill
            label="Salas"
            value={`${capacity.used}/${capacity.max}`}
            tone={capacity.used >= capacity.max ? 'amber' : 'violet'}
          />
        </Card>
      ) : null}

      {readySessions.length > 0 ? (
        <PetFarmAlertCard
          title={`${readySessions.length} aula${readySessions.length > 1 ? 's' : ''} concluída${readySessions.length > 1 ? 's' : ''}!`}
          subtitle="Colete XP e bônus de atributos.">
          <PetFarmPrimaryCta
            label={`${PET_ACADEMY_UI.collectAll} (${readySessions.length})`}
            onPress={() => void handleCollectAll()}
          />
        </PetFarmAlertCard>
      ) : null}

      <Card className="gap-3">
        <PetFarmCardHeader
          emoji="📖"
          title={PET_ACADEMY_UI.activeTitle}
          badge={academySessions.length > 0 ? String(academySessions.length) : undefined}
        />
        {academySessions.length === 0 ? (
          <PetFarmEmptyState
            emoji="🎓"
            title={PET_ACADEMY_UI.emptyActive}
            subtitle={PET_ACADEMY_UI.emptyActiveHint}
          />
        ) : (
          <View className="gap-2.5">
            {academySessions.map((session) => (
              <PetAcademySessionRow
                key={session.id}
                session={session}
                pet={instances.find((i) => i.id === session.instanceId)}
                nowMs={now}
                onCollect={() => void handleCollectOne(session.id)}
              />
            ))}
          </View>
        )}
      </Card>

      <Card className="gap-4">
        <PetFarmCardHeader emoji="✨" title={PET_ACADEMY_UI.startTitle} />
        <PetFarmSectionHint>{PET_ACADEMY_UI.pickPet}</PetFarmSectionHint>

        <PetFarmPetPicker
          pets={eligiblePets}
          selectedId={selectedPet?.id ?? null}
          onSelect={setSelectedPetId}
          emptyTitle="Nenhum pet disponível"
          emptySubtitle="Remova do pasto ou espere aventura/academia terminar."
        />

        <PetFarmSectionHint>{PET_ACADEMY_UI.pickTrack}</PetFarmSectionHint>
        <PetAcademyTrackGrid
          tracks={PET_ACADEMY_TRACKS}
          selectedKey={trackKey}
          onSelect={setTrackKey}
        />

        {selectedTrack ? (
          <PetAcademyMissionPreview track={selectedTrack} />
        ) : null}

        <PetFarmPrimaryCta
          label={PET_ACADEMY_UI.startCta}
          onPress={() => void handleStart()}
          disabled={!selectedPet}
        />
      </Card>

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};
