import { InventoryService } from '@/features/inventory/services/inventory-service';
import { RewardModifierService } from '@/features/game-design/services/reward-modifier-service';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';
import type { InventoryAcquisitionSource } from '@/types/inventory';

export const grantLootBoxReward = async (
  rarity: LootBoxRarityValue,
  source: InventoryAcquisitionSource = 'system',
): Promise<void> => {
  await InventoryService.addLootBox(rarity, source);
  if (RewardModifierService.rollLootBoxBonus()) {
    await InventoryService.addLootBox(LootBoxRarity.UNCOMMON, 'bonus');
  }
};
