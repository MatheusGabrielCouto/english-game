import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { PetGender } from '@/types/pet-instance';

import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetStage, type PetStageValue } from '@/types/pet';
import { cn } from '@/utils';
import { getBreedingOutcomes } from '../catalogs/pet-breeding-outcomes';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { PET_FARM_SCREEN_UI } from '../constants/pet-farm-screen-ui';
import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PET_INCUBATOR_UI } from '../constants/pet-incubator-ui';
import { PetBreedingService } from '../services/pet-breeding-service';
import { PetFarmService } from '../services/pet-farm-service';
import { toOutcomeDisplays } from '../utils/breeding-chance-display';
import { estimateStatRange } from '../utils/pet-stat-inheritance';
import {
    PetFarmCardHeader,
    PetFarmEmptyState,
    PetFarmFeedback,
    PetFarmPrimaryCta,
    PetFarmSecondaryCta,
    PetFarmSectionHint,
    PetFarmStepRow,
} from './PetFarmUiKit';
import { PetInstanceChip } from './PetInstanceChip';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const isAdultStage = (stage: PetStageValue): boolean =>
  stage === PetStage.ADULT || stage === PetStage.LEGENDARY;

export const PetBreedingScreenContent = () => {
  const router = useRouter();
  const [instances, setInstances] = useState<Awaited<ReturnType<typeof PetInstanceRepository.listAll>>>([]);
  const [motherId, setMotherId] = useState<number | null>(null);
  const [fatherId, setFatherId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    await PetFarmService.getFarmSnapshot();
    setInstances(await PetInstanceRepository.listAll());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mothers = instances.filter((i) => i.gender === PetGender.FEMALE && isAdultStage(i.stage));
  const fathers = instances.filter((i) => i.gender === PetGender.MALE && isAdultStage(i.stage));
  const mother = instances.find((i) => i.id === motherId);
  const father = instances.find((i) => i.id === fatherId);

  const outcomes = useMemo(() => {
    if (!mother || !father) return [];
    return toOutcomeDisplays(getBreedingOutcomes(mother.speciesKey, father.speciesKey));
  }, [mother, father]);

  const statRange = useMemo(() => {
    if (!mother || !father) return null;
    return estimateStatRange(mother.stats, father.stats);
  }, [mother, father]);

  const handleBreed = async () => {
    if (!motherId || !fatherId) {
      setMessage('Selecione mãe e pai.');
      return;
    }
    const result = await PetBreedingService.startBreeding(motherId, fatherId);
    setMessage(result.message);
    if (result.ok) {
      setMotherId(null);
      setFatherId(null);
      await load();
    }
  };

  const steps = [
    {
      label: PET_FARM_SCREEN_UI.stepMother,
      done: motherId !== null,
      active: motherId === null,
    },
    {
      label: PET_FARM_SCREEN_UI.stepFather,
      done: fatherId !== null,
      active: motherId !== null && fatherId === null,
    },
    {
      label: PET_FARM_SCREEN_UI.stepBreed,
      done: false,
      active: motherId !== null && fatherId !== null,
    },
  ];

  return (
    <View className="gap-4 pb-6">
      <PetFarmStepRow steps={steps} />

      <Card className="gap-3">
        <PetFarmCardHeader emoji="♀" title={PET_FARM_UI.mother} />
        {mothers.length === 0 ? (
          <PetFarmEmptyState
            emoji="♀"
            title="Sem mães disponíveis"
            subtitle={PET_FARM_SCREEN_UI.emptyMothers}
          />
        ) : (
          <View className="flex-row flex-wrap gap-2.5">
            {mothers.map((i) => (
              <PetInstanceChip
                key={i.id}
                instance={i}
                selected={motherId === i.id}
                onPress={() => setMotherId(i.id)}
                compact
              />
            ))}
          </View>
        )}
      </Card>

      <Card className="gap-3">
        <PetFarmCardHeader emoji="♂" title={PET_FARM_UI.father} />
        {fathers.length === 0 ? (
          <PetFarmEmptyState
            emoji="♂"
            title="Sem pais disponíveis"
            subtitle={PET_FARM_SCREEN_UI.emptyFathers}
          />
        ) : (
          <View className="flex-row flex-wrap gap-2.5">
            {fathers.map((i) => (
              <PetInstanceChip
                key={i.id}
                instance={i}
                selected={fatherId === i.id}
                onPress={() => setFatherId(i.id)}
                compact
              />
            ))}
          </View>
        )}
      </Card>

      {outcomes.length > 0 ? (
        <Card className="gap-3">
          <PetFarmCardHeader emoji="🧬" title={PET_FARM_UI.outcomes} />
          <View className="gap-2">
            {outcomes.map((o, index) => {
              const species = getSpeciesDefinition(o.speciesKey);
              const isTop = index === 0;
              return (
                <View
                  key={`${motherId ?? 'm'}-${fatherId ?? 'f'}-${o.speciesKey}-${index}`}
                  className={cn(
                    'flex-row items-center gap-3 rounded-xl border px-3 py-2.5',
                    isTop ? 'border-primary/40 bg-primary/10' : 'border-border bg-surface',
                  )}>
                  <PetSpeciesIcon speciesKey={o.speciesKey} size={28} />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-foreground">{species.name}</Text>
                    {isTop ? (
                      <Text className="text-[9px] font-bold text-primary">Mais provável</Text>
                    ) : null}
                  </View>
                  <Text className=" font-black text-primary">{o.percent}%</Text>
                </View>
              );
            })}
          </View>
          {statRange ? (
            <PetFarmSectionHint>
              Força estimada do filhote: {statRange.min.strength}–{statRange.max.strength}
            </PetFarmSectionHint>
          ) : null}
        </Card>
      ) : (
        <View className="rounded-xl border border-dashed border-border bg-surface px-4 py-5">
          <Text className="text-center text-xs text-muted">{PET_FARM_SCREEN_UI.selectBoth}</Text>
        </View>
      )}

      <PetFarmPrimaryCta
        label={PET_FARM_UI.startBreed}
        onPress={() => void handleBreed()}
        disabled={!motherId || !fatherId}
      />

      <PressableScale
        onPress={() => router.push(routes.petFarmEncyclopedia as Href)}
        className="items-center py-1"
        accessibilityRole="button">
        <Text className="text-xs font-bold text-primary">Ver enciclopédia de cruzamentos</Text>
      </PressableScale>

      <PetFarmSecondaryCta
        label={PET_INCUBATOR_UI.goIncubator}
        onPress={() => router.push(routes.petFarmIncubator as Href)}
      />

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};
