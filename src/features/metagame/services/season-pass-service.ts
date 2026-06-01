import { showGameToast } from '@/features/feedback/services/feedback-service';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { ShieldService } from '@/features/shields/services/shield-service';
import { TitleService } from '@/features/titles/services/title-service';
import { GameEvents } from '@/services/game-events';
import { getMetagameState, saveMetagameState } from '@/storage/repositories/metagame-repository';
import type { MetagameStateRecord } from '@/types/metagame';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';

import {
  SEASON_PASS_TIERS,
  SEASON_TIER_REWARDS,
  type SeasonTierReward,
} from '../constants/season-pass-catalog';
import { getCurrentSeasonTier, getSeasonKey } from '../constants/metagame-catalog';

export type SeasonTierStatus = 'locked' | 'claimable' | 'claimed';

export type SeasonTierView = {
  tier: number;
  pointsRequired: number;
  rewardLabel: string;
  status: SeasonTierStatus;
};

export type ClaimSeasonTierResult =
  | { ok: true; message: string; tier: number }
  | { ok: false; message: string };

const defaultLootRarity = LootBoxRarity.COMMON;

const grantReward = async (reward: SeasonTierReward): Promise<string[]> => {
  const labels: string[] = [];

  switch (reward.type) {
    case 'coins': {
      const amount = reward.amount ?? 0;
      if (amount > 0) {
        usePlayerStore.getState().addCoins(amount);
        labels.push(`${amount} moedas`);
      }
      break;
    }
    case 'shield': {
      const amount = reward.amount ?? 1;
      await ShieldService.grantShields(amount, 'event');
      labels.push(`${amount} escudo(s)`);
      break;
    }
    case 'loot_box': {
      const rarity = (reward.rarity ?? defaultLootRarity) as LootBoxRarityValue;
      await InventoryService.addLootBox(rarity, 'event');
      labels.push(`Loot box ${rarity}`);
      break;
    }
    case 'title': {
      if (reward.titleKey) {
        const granted = await TitleService.grantTitleByKey(reward.titleKey, true);
        if (granted) labels.push('Título sazonal');
      }
      break;
    }
    case 'special_item': {
      if (reward.itemKey) {
        await InventoryService.addSpecialItem(reward.itemKey, reward.amount ?? 1, 'event');
        labels.push('Item especial');
      }
      break;
    }
    default:
      break;
  }

  return labels;
};

const parseClaimedTiers = (json: string | undefined): number[] => {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 10);
  } catch {
    return [];
  }
};

export const SeasonPassService = {
  parseClaimedTiers,

  getTierViews(state: MetagameStateRecord): SeasonTierView[] {
    const currentTier = getCurrentSeasonTier(state.seasonPoints);
    const claimed = new Set(state.seasonClaimedTiers);

    return SEASON_PASS_TIERS.map((entry) => {
      let status: SeasonTierStatus = 'locked';
      if (claimed.has(entry.tier)) {
        status = 'claimed';
      } else if (entry.tier <= currentTier) {
        status = 'claimable';
      }

      return {
        tier: entry.tier,
        pointsRequired: entry.pointsRequired,
        rewardLabel: entry.rewardLabel,
        status,
      };
    });
  },

  countClaimable(state: MetagameStateRecord): number {
    return SeasonPassService.getTierViews(state).filter((t) => t.status === 'claimable').length;
  },

  async claimTier(tier: number): Promise<ClaimSeasonTierResult> {
    const state = (await getMetagameState()) ?? null;
    if (!state) {
      return { ok: false, message: 'Progresso de temporada indisponível.' };
    }

    if (state.seasonKey !== getSeasonKey()) {
      return { ok: false, message: 'Temporada desatualizada. Reabra a tela.' };
    }

    const entry = SEASON_PASS_TIERS.find((t) => t.tier === tier);
    if (!entry) {
      return { ok: false, message: 'Tier inválido.' };
    }

    if (state.seasonClaimedTiers.includes(tier)) {
      return { ok: false, message: 'Recompensa já resgatada.' };
    }

    const currentTier = getCurrentSeasonTier(state.seasonPoints);
    if (tier > currentTier) {
      return { ok: false, message: `Você precisa de ${entry.pointsRequired} pts nesta temporada.` };
    }

    const rewards = SEASON_TIER_REWARDS[tier] ?? [];
    const grantedLabels: string[] = [];

    for (const reward of rewards) {
      const labels = await grantReward(reward);
      grantedLabels.push(...labels);
    }

    const nextState: MetagameStateRecord = {
      ...state,
      seasonClaimedTiers: [...state.seasonClaimedTiers, tier].sort((a, b) => a - b),
      updatedAt: new Date().toISOString(),
    };

    await saveMetagameState(nextState);

    const message =
      grantedLabels.length > 0
        ? `Tier ${tier} resgatado: ${grantedLabels.join(', ')}!`
        : `Tier ${tier} resgatado!`;

    showGameToast(message, 'success');
    GameEvents.emit({ type: 'SEASON_REWARD_CLAIMED', tier, label: entry.rewardLabel });

    return { ok: true, message, tier };
  },
};
