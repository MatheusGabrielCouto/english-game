import { PET_SPECIES_BY_KEY } from '@/features/game-design/catalogs/pet-species-catalog';
import type { Pet } from '@/types/pet';

export type PetIncubationClock = {
  isTimed: boolean;
  remainingMs: number;
  progressPct: number;
  displayTime: string;
  displaySubtime: string | null;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

export const formatIncubationCountdown = (remainingMs: number): { main: string; sub: string | null } => {
  if (remainingMs <= 0) {
    return { main: '00:00', sub: null };
  }

  const totalSec = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) {
    return {
      main: `${days}d ${pad2(hours)}h`,
      sub: `${pad2(minutes)}m ${pad2(seconds)}s`,
    };
  }

  if (hours > 0) {
    return {
      main: `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`,
      sub: null,
    };
  }

  return {
    main: `${pad2(minutes)}:${pad2(seconds)}`,
    sub: null,
  };
};

export const getIncubationClock = (pet: Pet, nowMs = Date.now()): PetIncubationClock => {
  if (pet.hatchAt && pet.isIncubating) {
    const endMs = new Date(pet.hatchAt).getTime();
    const species = PET_SPECIES_BY_KEY[pet.speciesKey] ?? PET_SPECIES_BY_KEY.codeowl;
    const startMs = endMs - species.hatchHours * 60 * 60 * 1000;
    const remainingMs = Math.max(0, endMs - nowMs);
    const span = Math.max(1, endMs - startMs);
    const progressPct = Math.min(100, Math.max(0, Math.round(((nowMs - startMs) / span) * 100)));
    const { main, sub } = formatIncubationCountdown(remainingMs);

    return {
      isTimed: true,
      remainingMs,
      progressPct,
      displayTime: remainingMs <= 0 ? '00:00' : main,
      displaySubtime: sub,
    };
  }

  const levelProgress = Math.min(100, Math.round((pet.level / 5) * 100));

  return {
    isTimed: false,
    remainingMs: 0,
    progressPct: levelProgress,
    displayTime: `Nv. ${pet.level}/5`,
    displaySubtime: 'Evolua estudando',
  };
};
