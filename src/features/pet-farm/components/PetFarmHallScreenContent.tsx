import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components';
import type { PetHallPedestal } from '@/types/pet-hall';
import { PET_HALL_SLOT_COUNT } from '@/types/pet-hall';

import { PET_HALL_UI } from '../constants/pet-hall-ui';
import { usePetFarmLoad } from '../hooks/use-pet-farm-load';
import { PetHallService } from '../services/pet-hall-service';
import {
  PetFarmCardHeader,
  PetFarmFeedback,
  PetFarmPrimaryCta,
  PetFarmSectionHint,
  PetFarmStatPill,
} from './PetFarmUiKit';
import { PetHallPedestalCard } from './PetHallScreenParts';

export const PetFarmHallScreenContent = () => {
  const { load } = usePetFarmLoad();
  const [pedestals, setPedestals] = useState<PetHallPedestal[]>([]);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setPedestals(await PetHallService.getPedestals());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filledCount = useMemo(
    () => pedestals.filter((p) => p.instance !== null).length,
    [pedestals],
  );

  const handleAutoFill = async () => {
    const result = await PetHallService.autoFillHall();
    setMessage(result.message);
    await Promise.all([refresh(), load()]);
  };

  const handleInduct = async (pedestal: PetHallPedestal) => {
    if (!pedestal.suggestedInstance) return;
    const result = await PetHallService.assignToSlot(
      pedestal.suggestedInstance.id,
      pedestal.slot,
    );
    setMessage(result.message);
    await Promise.all([refresh(), load()]);
  };

  const handleRemove = async (slot: number) => {
    const result = await PetHallService.removeFromSlot(slot);
    setMessage(result.message);
    await Promise.all([refresh(), load()]);
  };

  return (
    <View className="gap-4 pb-8">
      <Card className="gap-3 border-amber-500/25 bg-amber-950/10">
        <PetFarmCardHeader emoji="👑" title="Hall da Fama" />
        <PetFarmSectionHint>{PET_HALL_UI.subtitle}</PetFarmSectionHint>
        <View className="flex-row flex-wrap gap-2">
          <PetFarmStatPill
            label="Pedestais"
            value={PET_HALL_UI.filledCount(filledCount, PET_HALL_SLOT_COUNT)}
            tone="amber"
          />
        </View>
        <PetFarmPrimaryCta label={PET_HALL_UI.autoFillCta} onPress={() => void handleAutoFill()} />
      </Card>

      <View className="flex-row flex-wrap gap-3">
        {pedestals.map((pedestal) => (
          <View key={pedestal.slot} className="w-[48%] flex-grow">
            <PetHallPedestalCard
              pedestal={pedestal}
              onInductSuggested={() => void handleInduct(pedestal)}
              onRemove={() => void handleRemove(pedestal.slot)}
            />
          </View>
        ))}
      </View>

      {message ? <PetFarmFeedback message={message} /> : null}
    </View>
  );
};
