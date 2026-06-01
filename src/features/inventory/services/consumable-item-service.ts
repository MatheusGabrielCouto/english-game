import { showGameToast } from '@/features/feedback/services/feedback-service';
import { BoosterModifierCache } from '@/features/game-design/services/booster-modifier-cache';
import {
  isItemUsable,
  resolveGameItem,
  type GameItemDefinition,
} from '@/features/game-design/catalogs/item-catalog';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { ShieldService } from '@/features/shields/services/shield-service';
import { GameEvents } from '@/services/game-events';
import { ActiveBoosterRepository } from '@/storage/repositories/active-booster-repository';
import { InventorySpecialItemRepository } from '@/storage/repositories/inventory-special-item-repository';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';

export type UseConsumableResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const LOOT_KEY_RARITY: Record<number, LootBoxRarityValue> = {
  1: LootBoxRarity.RARE,
  2: LootBoxRarity.EPIC,
  3: LootBoxRarity.LEGENDARY,
};

const percentForTimedEffect = (def: GameItemDefinition): {
  xp?: number;
  coins?: number;
  loot?: number;
  contract?: number;
} => {
  const value = def.effectValue;
  const secondary = def.secondaryValue ?? 0;

  switch (def.effectType) {
    case 'double_xp':
      return { xp: 100 };
    case 'double_coins':
      return { coins: 100 };
    case 'timed_xp_percent':
      if (def.key === 'combo_estudo_1h') {
        return { xp: value, coins: secondary, loot: secondary };
      }
      return { xp: value };
    case 'timed_coin_percent':
      return { coins: value };
    case 'timed_loot_luck':
      return { loot: value };
    case 'timed_contract_percent':
    case 'quest_multiplier':
      return { contract: value };
    default:
      return {};
  }
};

const activateTimedBooster = async (def: GameItemDefinition): Promise<void> => {
  const minutes = def.durationMinutes ?? 60;
  const now = Date.now();
  const expiresAt = new Date(now + minutes * 60_000).toISOString();
  const parts = percentForTimedEffect(def);

  const entries: Array<{ key: string; multiplier: number }> = [];

  if (parts.xp) entries.push({ key: `${def.key}_xp`, multiplier: parts.xp });
  if (parts.coins) entries.push({ key: `${def.key}_coins`, multiplier: parts.coins });
  if (parts.loot) entries.push({ key: `${def.key}_loot`, multiplier: parts.loot });
  if (parts.contract) entries.push({ key: `${def.key}_contract`, multiplier: parts.contract });

  if (entries.length === 0) {
    entries.push({ key: def.key, multiplier: def.effectValue });
  }

  for (const entry of entries) {
    await ActiveBoosterRepository.create({
      boosterKey: entry.key,
      multiplier: entry.multiplier,
      expiresAt,
      source: 'consumable',
    });
  }

  await BoosterModifierCache.refresh();
};

const grantFlatXp = (amount: number) => {
  usePlayerStore.getState().addXP(amount);
  GameEvents.emit({ type: 'PET_EXPERIENCE_GRANT', amount: Math.max(1, Math.round(amount * 0.25)) });
};

export const ConsumableItemService = {
  async use(itemKey: string): Promise<UseConsumableResult> {
    if (!isItemUsable(itemKey)) {
      return { ok: false, message: 'Este item não pode ser usado.' };
    }

    const def = resolveGameItem(itemKey);
    if (!def) {
      return { ok: false, message: 'Item desconhecido.' };
    }

    const row = await InventorySpecialItemRepository.findByItemKey(itemKey);
    if (!row || row.quantity < 1) {
      return { ok: false, message: 'Você não tem este item no inventário.' };
    }

    switch (def.effectType) {
      case 'xp_boost':
        grantFlatXp(def.effectValue);
        break;
      case 'coin_boost':
        usePlayerStore.getState().addCoins(def.effectValue);
        break;
      case 'shield_repair':
        await ShieldService.grantShields(def.effectValue, 'event');
        break;
      case 'streak_protection':
        await ShieldService.grantShields(def.effectValue, 'event');
        break;
      case 'flavor_bundle':
        grantFlatXp(def.effectValue);
        if (def.secondaryValue) {
          usePlayerStore.getState().addCoins(def.secondaryValue);
        }
        break;
      case 'free_loot':
        await InventoryService.addLootBox(LootBoxRarity.COMMON, 'event');
        break;
      case 'unlock_loot': {
        const rarity = LOOT_KEY_RARITY[def.effectValue] ?? LootBoxRarity.RARE;
        await InventoryService.addLootBox(rarity, 'event');
        break;
      }
      case 'double_xp':
      case 'double_coins':
      case 'timed_xp_percent':
      case 'timed_coin_percent':
      case 'timed_loot_luck':
      case 'timed_contract_percent':
      case 'quest_multiplier':
        await activateTimedBooster(def);
        break;
      case 'passive_xp':
      case 'passive_coins':
        return { ok: false, message: 'Relíquias passivas vêm do livro de coleção.' };
      default:
        return { ok: false, message: 'Efeito deste item ainda não está disponível.' };
    }

    const consumed = await InventorySpecialItemRepository.consumeOne(itemKey);
    if (!consumed) {
      return { ok: false, message: 'Não foi possível consumir o item.' };
    }

    await InventoryService.refresh();

    const message = buildUseMessage(def);
    showGameToast(message, 'success');

    return { ok: true, message };
  },
};

const buildUseMessage = (def: GameItemDefinition): string => {
  if (def.durationMinutes) {
    const mins = def.durationMinutes;
    const durationLabel = mins >= 60 ? `${Math.round(mins / 60)}h` : `${mins}min`;
    return `${def.name} ativado por ${durationLabel}!`;
  }

  switch (def.effectType) {
    case 'xp_boost':
      return `+${def.effectValue} XP aplicado!`;
    case 'coin_boost':
      return `+${def.effectValue} moedas!`;
    case 'shield_repair':
    case 'streak_protection':
      return `+${def.effectValue} escudo(s) adicionado(s)!`;
    case 'free_loot':
      return 'Loot box Comum adicionada ao inventário!';
    case 'unlock_loot':
      return 'Loot box adicionada ao inventário!';
    case 'flavor_bundle':
      return `${def.name} aberto — recompensas recebidas!`;
    default:
      return `${def.name} usado!`;
  }
};
