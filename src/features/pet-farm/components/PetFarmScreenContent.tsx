import { useCallback, useEffect } from 'react';
import { View } from 'react-native';

import { DomainGlossaryBanner } from '@/components/ui';

import { PetFarmService } from '../services/pet-farm-service';
import { PetRosterService } from '../services/pet-roster-service';
import { usePetFarmStore } from '../store/pet-farm-store';
import { PetFarmMapScreen } from './PetFarmMapScreen';

export const PetFarmScreenContent = () => {
  const setSnapshot = usePetFarmStore((s) => s.setSnapshot);
  const setLoading = usePetFarmStore((s) => s.setLoading);

  const load = useCallback(async () => {
    setLoading(true);
    await PetRosterService.ensureInitialized();
    const data = await PetFarmService.getFarmSnapshot();
    setSnapshot(data);
    setLoading(false);
  }, [setLoading, setSnapshot]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View className="gap-4">
      <DomainGlossaryBanner variant="petFarm" />
      <PetFarmMapScreen />
    </View>
  );
};
