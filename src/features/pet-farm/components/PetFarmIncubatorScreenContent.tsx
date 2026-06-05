import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { routes } from '@/constants';
import { cn } from '@/utils';

import { PET_FARM_SCREEN_UI } from '../constants/pet-farm-screen-ui';
import { PET_INCUBATOR_UI } from '../constants/pet-incubator-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { PetBreedingService } from '../services/pet-breeding-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import {
    PetFarmCapacityBar,
    PetFarmCardHeader,
    PetFarmEmptyState,
    PetFarmFeedback,
    PetFarmPrimaryCta,
    PetFarmSecondaryCta,
} from './PetFarmUiKit';
import { PetSpeciesIcon } from './PetSpeciesIcon';

export const PetFarmIncubatorScreenContent = () => {
  const router = useRouter();
  const incubators = usePetFarmStore((s) => s.incubators);
  const fields = usePetFarmStore((s) => s.fields);
  const { load } = usePetFarmLoad();
  const [message, setMessage] = useState('');

  const readyEggs = useMemo(
    () => incubators.filter((e) => new Date(e.hatchAt).getTime() <= Date.now()),
    [incubators],
  );

  const handleHatchReady = async () => {
    const messages = await PetBreedingService.processReadyIncubators();
    await load();
    setMessage(messages.length > 0 ? messages.join(' ') : PET_INCUBATOR_UI.hatchDone);
  };

  return (
    <View className="gap-4 pb-6">
      <Card className="gap-3">
        <PetFarmCardHeader
          emoji="🥚"
          title="Fila de ovos"
          badge={
            readyEggs.length > 0
              ? `${readyEggs.length} pronto${readyEggs.length > 1 ? 's' : ''}`
              : undefined
          }
        />
        <PetFarmCapacityBar
          label="Capacidade da incubadora"
          used={incubators.length}
          max={fields.incubator_room}
        />
        {readyEggs.length > 0 ? (
          <PetFarmPrimaryCta
            label={`${PET_INCUBATOR_UI.hatchAll} (${readyEggs.length})`}
            onPress={() => void handleHatchReady()}
            accessibilityLabel={PET_INCUBATOR_UI.hatchAll}
          />
        ) : null}
        {incubators.length === 0 ? (
          <PetFarmEmptyState
            emoji="🔥"
            title={PET_INCUBATOR_UI.empty}
            subtitle={PET_FARM_SCREEN_UI.emptyIncubator}
          />
        ) : (
          <View className="gap-2">
            {incubators.map((egg) => {
              const ready = new Date(egg.hatchAt).getTime() <= Date.now();
              return (
                <View
                  key={egg.id}
                  className={cn(
                    'flex-row items-center gap-3 rounded-2xl border px-3 py-3',
                    ready
                      ? 'border-amber-500/45 bg-amber-500/10'
                      : 'border-border bg-surface',
                  )}>
                  <View
                    className={cn(
                      'h-12 w-12 items-center justify-center rounded-xl',
                      ready ? 'bg-amber-500/15' : 'bg-surface-elevated',
                    )}>
                    <PetSpeciesIcon speciesKey={egg.speciesKey} size={36} />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text
                      className={cn(
                        'text-xs font-bold',
                        ready ? 'text-amber-200' : 'text-foreground',
                      )}>
                      {ready ? PET_INCUBATOR_UI.eggReady : PET_INCUBATOR_UI.incubating}
                    </Text>
                    <Text className="text-[10px] text-muted">
                      {PET_INCUBATOR_UI.hatchAt(
                        new Date(egg.hatchAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                      )}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      'h-9 w-9 items-center justify-center rounded-full',
                      ready ? 'bg-amber-500/25' : 'bg-primary/15',
                    )}>
                    <Text className="text-base">{ready ? '✨' : '🔥'}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <PetFarmSecondaryCta
        label={PET_INCUBATOR_UI.goLab}
        onPress={() => router.push(routes.petFarmBreeding as Href)}
      />

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};
