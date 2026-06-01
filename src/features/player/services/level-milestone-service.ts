import { LootBoxService } from '@/features/loot-boxes/services/loot-box-service';
import { LEVEL_MILESTONE_INTERVAL } from '@/features/game-design/constants/balance';
import { PlayerService } from '@/features/player/services/player-service';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { LootBoxRarity } from '@/types/inventory';

const milestoneLootRarity = (level: number) => {
  if (level >= 100) return LootBoxRarity.LEGENDARY;
  if (level >= 50) return LootBoxRarity.EPIC;
  if (level >= 25) return LootBoxRarity.RARE;
  if (level >= 10) return LootBoxRarity.UNCOMMON;
  return LootBoxRarity.COMMON;
};

const handleLevelUp = async (level: number): Promise<void> => {
  if (level % LEVEL_MILESTONE_INTERVAL !== 0) return;

  const coinReward = level * 25;
  PlayerService.addCoins(coinReward);
  await LootBoxService.grantLootBox(milestoneLootRarity(level), 'level_milestone');
};

let listenersInitialized = false;

export const LevelMilestoneService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      if (event.type === 'PLAYER_LEVEL_UP') {
        void handleLevelUp(event.level);
      }
    });
  },
};
