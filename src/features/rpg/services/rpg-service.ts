import { ATTRIBUTE_GAIN_BY_CATEGORY, RPG_PERKS } from '@/features/game-design/constants/rpg';
import type { RpgAttributeValue } from '@/features/game-design/constants/rpg';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { PlayerRpgRepository } from '@/storage/repositories/player-rpg-repository';
import type { PlayerRpgRecord } from '@/features/game-design/constants/rpg';

import { useRpgStore } from '../store/rpg-store';

const refreshStore = async (): Promise<void> => {
  const record = await PlayerRpgRepository.getOrCreate();
  useRpgStore.setState({ record, isLoading: false });
};

const checkPerkUnlocks = async (record: PlayerRpgRecord): Promise<void> => {
  for (const perk of RPG_PERKS) {
    if (record.unlockedPerks.includes(perk.key)) continue;
    const value = record[perk.requiredAttribute];
    if (value >= perk.requiredValue) {
      await PlayerRpgRepository.unlockPerk(perk.key);
    }
  }
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  if (event.type !== 'DAILY_MISSION_COMPLETED' || !event.category) return;

  const attribute = ATTRIBUTE_GAIN_BY_CATEGORY[event.category] as RpgAttributeValue | undefined;
  if (!attribute) return;

  const next = await PlayerRpgRepository.incrementAttribute(attribute, 1);
  await checkPerkUnlocks(next);
  await refreshStore();
};

let listenersInitialized = false;

export const RpgService = {
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

  getXpBonusPercent(record: PlayerRpgRecord): number {
    let bonus = 0;
    for (const perkKey of record.unlockedPerks) {
      const perk = RPG_PERKS.find((entry) => entry.key === perkKey);
      if (perk?.bonusType === 'xp') bonus += perk.bonusValue;
    }
    return bonus;
  },
};
