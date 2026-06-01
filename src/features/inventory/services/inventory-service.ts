import { STAGE_CONFIG } from '@/features/pet/constants';
import { LootBoxAnalyticsRepository } from '@/storage/repositories/loot-box-analytics-repository';
import { getCurrentPet } from '@/storage/repositories/pet-repository';
import { getPlayer } from '@/storage/repositories/player-repository';
import { InventoryLootBoxRepository } from '@/storage/repositories/inventory-loot-box-repository';
import {
  InventoryAnalyticsRepository,
  InventoryHistoryRepository,
} from '@/storage/repositories/inventory-history-repository';
import { InventorySpecialItemRepository } from '@/storage/repositories/inventory-special-item-repository';
import { GameEvents, type GameEvent } from '@/services/game-events';
import {
  InventoryCategory,
  type InventoryAcquisitionSource,
  type InventoryCategoryValue,
  type InventorySnapshot,
  type LootBoxRarityValue,
} from '@/types/inventory';

import { INVENTORY_MESSAGES } from '../constants';
import { buildLootBoxSnapshot, buildPetSnapshot } from '../utils/inventory';

type InventoryListener = (snapshot: InventorySnapshot) => void;

let listenersInitialized = false;
const inventoryListeners = new Set<InventoryListener>();
let cachedSnapshot: InventorySnapshot | null = null;

const notifyListeners = () => {
  if (!cachedSnapshot) return;
  inventoryListeners.forEach((listener) => listener(cachedSnapshot as InventorySnapshot));
};

const recordAcquisition = async (
  category: InventoryCategoryValue,
  itemKey: string,
  quantity: number,
  message: string,
  source: InventoryAcquisitionSource,
  analyticsUpdate: {
    shields?: number;
    lootBoxes?: number;
    specialItems?: number;
  },
): Promise<void> => {
  await InventoryHistoryRepository.create({
    category,
    itemKey,
    quantity,
    message,
    source,
    acquiredAt: new Date().toISOString(),
  });

  const analytics = await InventoryAnalyticsRepository.getOrCreate();
  await InventoryAnalyticsRepository.save({
    totalItemsAcquired: analytics.totalItemsAcquired + Math.abs(quantity),
    totalShieldsReceived: analytics.totalShieldsReceived + (analyticsUpdate.shields ?? 0),
    totalLootBoxesReceived: analytics.totalLootBoxesReceived + (analyticsUpdate.lootBoxes ?? 0),
    totalSpecialItemsReceived:
      analytics.totalSpecialItemsReceived + (analyticsUpdate.specialItems ?? 0),
    lastUpdatedAt: new Date().toISOString(),
  });

  cachedSnapshot = await InventoryService.buildSnapshot();
  notifyListeners();
};

export const InventoryService = {
  subscribe(listener: InventoryListener): () => void {
    inventoryListeners.add(listener);
    if (cachedSnapshot) listener(cachedSnapshot);
    return () => inventoryListeners.delete(listener);
  },

  getCachedSnapshot(): InventorySnapshot | null {
    return cachedSnapshot;
  },

  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void InventoryService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'SHIELD_EARNED':
        await InventoryService.recordShieldEarned(event.amount);
        break;
      case 'SHIELD_USED':
        await InventoryService.recordShieldUsed(event.count);
        break;
      case 'PET_STAGE_EVOLVED': {
        const stageLabel =
          STAGE_CONFIG[event.stage as keyof typeof STAGE_CONFIG]?.label ?? event.stage;
        await InventoryService.recordPetEvolution(event.stage, stageLabel);
        break;
      }
      case 'LOOT_BOX_RECEIVED':
        await InventoryService.recordLootBoxReceived(
          event.rarity as LootBoxRarityValue,
          event.source as InventoryAcquisitionSource,
        );
        break;
      default:
        break;
    }
  },

  async buildSnapshot(): Promise<InventorySnapshot> {
    const player = await getPlayer();
    const pet = await getCurrentPet();
    const lootBoxes = await InventoryLootBoxRepository.findUnopened();
    const specialItems = await InventorySpecialItemRepository.findAll();
    const analytics = await InventoryAnalyticsRepository.getOrCreate();

    return {
      shields: { quantity: player?.shields ?? 0 },
      lootBoxes: buildLootBoxSnapshot(lootBoxes),
      pet: buildPetSnapshot(pet),
      specialItems,
      analytics,
    };
  },

  async initialize(): Promise<InventorySnapshot> {
    cachedSnapshot = await InventoryService.buildSnapshot();
    notifyListeners();
    return cachedSnapshot;
  },

  async refresh(): Promise<InventorySnapshot> {
    return InventoryService.initialize();
  },

  async recordShieldEarned(
    amount: number,
    source: InventoryAcquisitionSource = 'streak',
  ): Promise<void> {
    if (amount <= 0) return;

    await recordAcquisition(
      InventoryCategory.SHIELD,
      'shield',
      amount,
      INVENTORY_MESSAGES.shieldEarned(amount),
      source,
      { shields: amount },
    );
  },

  async recordShieldUsed(count: number): Promise<void> {
    if (count <= 0) return;

    await recordAcquisition(
      InventoryCategory.SHIELD,
      'shield',
      -count,
      INVENTORY_MESSAGES.shieldUsed(count),
      'system',
      {},
    );
  },

  async recordPetEvolution(stage: string, stageLabel: string): Promise<void> {
    await recordAcquisition(
      InventoryCategory.PET,
      stage,
      1,
      INVENTORY_MESSAGES.petEvolved(stageLabel),
      'pet',
      {},
    );
  },

  async recordLootBoxReceived(
    rarity: LootBoxRarityValue,
    source: InventoryAcquisitionSource,
  ): Promise<void> {
    await recordAcquisition(
      InventoryCategory.LOOT_BOX,
      `loot_box_${rarity}`,
      1,
      INVENTORY_MESSAGES.lootBoxReceived(rarity),
      source,
      { lootBoxes: 1 },
    );
  },

  async addLootBox(
    rarity: LootBoxRarityValue,
    source: InventoryAcquisitionSource = 'system',
  ): Promise<void> {
    await InventoryLootBoxRepository.create(rarity, source);
    await LootBoxAnalyticsRepository.incrementReceived(1);
    GameEvents.emit({ type: 'LOOT_BOX_RECEIVED', rarity, source });
  },

  async consumeLootBoxForUpgrade(id: number): Promise<boolean> {
    const removed = await InventoryLootBoxRepository.deleteById(id);
    if (!removed) return false;

    await InventoryService.refresh();
    return true;
  },

  async addSpecialItem(
    itemKey: string,
    quantity: number,
    source: InventoryAcquisitionSource = 'system',
  ): Promise<void> {
    await InventorySpecialItemRepository.upsert(itemKey, quantity, source);
    await recordAcquisition(
      InventoryCategory.SPECIAL,
      itemKey,
      quantity,
      INVENTORY_MESSAGES.specialItemReceived(itemKey),
      source,
      { specialItems: quantity },
    );
  },

  async getHistory(limit = 15) {
    return InventoryHistoryRepository.findRecent(limit);
  },
};
