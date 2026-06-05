import { useCallback, useEffect } from 'react';

import { PetFarmService } from '../services/pet-farm-service';
import { usePetFarmStore } from '../store/pet-farm-store';

export const usePetFarmLoad = () => {
  const setSnapshot = usePetFarmStore((s) => s.setSnapshot);
  const setLoading = usePetFarmStore((s) => s.setLoading);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await PetFarmService.getFarmSnapshot();
    setSnapshot(data);
    setLoading(false);
    return data;
  }, [setLoading, setSnapshot]);

  useEffect(() => {
    void load();
  }, [load]);

  return { load };
};
