import { useCallback, useEffect, useState } from 'react';

import { usePlayerStore } from '@/features/player';
import type { Pet } from '@/types/pet';

import { PetService } from '../services/pet-service';
import { usePetScreenStore } from '../store/pet-screen-store';

export const usePet = () => {
  const currentStreak = usePlayerStore((s) => s.currentStreak);
  const [pet, setPet] = useState<Pet | null>(PetService.getCachedPet());
  const isLoading = usePetScreenStore((s) => s.isLoading);
  const isRefreshing = usePetScreenStore((s) => s.isRefreshing);
  const setLoading = usePetScreenStore((s) => s.setLoading);
  const setRefreshing = usePetScreenStore((s) => s.setRefreshing);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const nextPet = await PetService.refresh();
    await PetService.updateMood(currentStreak);
    setPet(PetService.getCachedPet() ?? nextPet);
    setRefreshing(false);
    setLoading(false);
  }, [currentStreak, setLoading, setRefreshing]);

  useEffect(() => {
    const unsubscribe = PetService.subscribe((nextPet) => {
      setPet(nextPet);
      setLoading(false);
    });

    if (!PetService.getCachedPet()) {
      void refresh();
    } else {
      setLoading(false);
    }

    return unsubscribe;
  }, [refresh, setLoading]);

  useEffect(() => {
    void PetService.updateMood(currentStreak);
  }, [currentStreak]);

  const addExperience = useCallback(async (amount: number) => {
    const updated = await PetService.addExperience(amount);
    if (updated) setPet(updated);
    return updated;
  }, []);

  const updateMood = useCallback(async () => {
    const updated = await PetService.updateMood(currentStreak);
    setPet(updated);
    return updated;
  }, [currentStreak]);

  return {
    pet,
    isLoading,
    isRefreshing,
    refresh,
    addExperience,
    updateMood,
  };
};
