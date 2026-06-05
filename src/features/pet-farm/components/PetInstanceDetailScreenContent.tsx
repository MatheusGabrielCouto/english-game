import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import type { PetInstance } from '@/types/pet-instance';

import { PetFarmService } from '../services/pet-farm-service';
import { PetRosterService } from '../services/pet-roster-service';
import { PetInstanceDetailHero } from './PetInstanceDetailHero';
import { PetInstanceFavoritePicker } from './PetInstanceFavoritePicker';
import { PetInstanceHubActions } from './PetInstanceHubActions';
import { PetInstanceHubSummary } from './PetInstanceHubSummary';
import { PetInstanceHubTabs } from './PetInstanceHubTabs';

type PetInstanceDetailScreenContentProps = {
  instanceId: number;
};

export const PetInstanceDetailScreenContent = ({ instanceId }: PetInstanceDetailScreenContentProps) => {
  const [instance, setInstance] = useState<PetInstance | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const row = await PetInstanceRepository.findById(instanceId);
    setInstance(row);
    setLoading(false);
  }, [instanceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSetActive = async () => {
    if (!instance) return;
    try {
      await PetRosterService.setActiveInstance(instance.id);
      setMessage(`${instance.nickname} é seu companheiro na Home.`);
      await load();
    } catch {
      setMessage('Não foi possível trocar o companheiro.');
    }
  };

  const handleRemoveFromPasture = async () => {
    if (!instance || instance.passiveFieldSlot === null) return;
    await PetFarmService.removeFromPassiveSlot(instance.id);
    setMessage(`${instance.nickname} saiu do pasto.`);
    await load();
  };

  if (loading || !instance) {
    return (
      <View className="py-12">
        <Text className="text-center text-muted">Carregando…</Text>
      </View>
    );
  }

  return (
    <View className="gap-4 pb-8">
      <PetInstanceDetailHero instance={instance} />
      <PetInstanceFavoritePicker
        instance={instance}
        onChanged={(msg) => {
          setMessage(msg);
          void load();
        }}
      />
      <PetInstanceHubSummary instance={instance} />
      <PetInstanceHubActions
        instance={instance}
        onSetActive={() => void handleSetActive()}
        onRemoveFromPasture={() => void handleRemoveFromPasture()}
      />
      <PetInstanceHubTabs
        instance={instance}
        onRerolled={() => void load()}
        onMessage={setMessage}
      />
      {message ? <Text className="text-center text-xs text-muted">{message}</Text> : null}
    </View>
  );
};
