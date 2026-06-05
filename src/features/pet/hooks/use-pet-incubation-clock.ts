import { useEffect, useState } from 'react';

import type { Pet } from '@/types/pet';

import { getIncubationClock, type PetIncubationClock } from '../utils/incubation-clock';

export const usePetIncubationClock = (pet: Pet): PetIncubationClock => {
  const [clock, setClock] = useState(() => getIncubationClock(pet));

  useEffect(() => {
    const tick = () => setClock(getIncubationClock(pet));
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [pet.id, pet.hatchAt, pet.isIncubating, pet.level, pet.speciesKey]);

  return clock;
};
