import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityResourceRepository } from '@/storage/repositories/city-resource-repository';
import { CityResourceType, type CityResourceBalances, type CityResourceTypeValue } from '@/types/city-resource';

import {
  BRICKS_PER_WORD_LEARNED,
  CEMENT_PER_SPEAKING_SESSION,
  WOOD_PER_STUDY_DAY,
} from '../constants/city-resource-config';
import { useCityMapStore } from '../store/city-map-store';

let listenersInitialized = false;
let cachedBalances: CityResourceBalances | null = null;

const refreshStore = async (): Promise<void> => {
  await CityResourceRepository.ensureSeeded();
  cachedBalances = await CityResourceRepository.getBalances();
  useCityMapStore.setState({ resourceBalances: cachedBalances });
};

const grantResource = async (
  resourceType: CityResourceTypeValue,
  amount: number,
  source: string,
): Promise<void> => {
  if (amount <= 0) return;

  await CityResourceRepository.add(resourceType, amount);
  await refreshStore();

  GameEvents.emit({
    type: 'CITY_RESOURCE_EARNED',
    resourceType,
    amount,
    source,
    newBalance: cachedBalances?.[resourceType] ?? amount,
  });
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  if (event.type === 'WORDS_LEARNED') {
    const bricks = Math.max(1, Math.round(event.amount * BRICKS_PER_WORD_LEARNED));
    await grantResource(CityResourceType.LEXICON_BRICK, bricks, 'farm_vocabulary');
    return;
  }

  if (event.type === 'SPEAKING_SESSION_COMPLETED') {
    const cement = Math.max(1, Math.round(event.amount * CEMENT_PER_SPEAKING_SESSION));
    await grantResource(CityResourceType.FLUENCY_CEMENT, cement, 'farm_speaking');
    return;
  }

  if (event.type === 'STUDY_DAY_RECORDED') {
    await grantResource(CityResourceType.CONSISTENCY_WOOD, WOOD_PER_STUDY_DAY, 'study_day');
  }
};

export const CityResourceService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  async initialize(): Promise<void> {
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },

  getCachedBalances(): CityResourceBalances | null {
    return cachedBalances;
  },

  async getBalances(): Promise<CityResourceBalances> {
    if (!cachedBalances) {
      await refreshStore();
    }
    return cachedBalances ?? (await CityResourceRepository.getBalances());
  },

  async spend(
    resourceType: CityResourceTypeValue,
    amount: number,
  ): Promise<boolean> {
    const ok = await CityResourceRepository.spend(resourceType, amount);
    if (ok) {
      await refreshStore();
    }
    return ok;
  },

  async grant(
    resourceType: CityResourceTypeValue,
    amount: number,
    source: string,
  ): Promise<void> {
    await grantResource(resourceType, amount, source);
  },
};
