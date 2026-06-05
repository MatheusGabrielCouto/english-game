import { useAppStore } from '@/features/app/store/app-store';
import { CityVitalityService } from '@/features/city/services/city-vitality-service';
import { useCityMapStore } from '@/features/city/store/city-map-store';
import { useCollectionBookStore } from '@/features/collection-book/store/collection-book-store';
import { PET_SPECIES_BY_KEY } from '@/features/game-design/catalogs/pet-species-catalog';
import { GLOBAL_BONUS_CAP_PERCENT } from '@/features/game-design/constants/balance';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { RPG_PERKS } from '@/features/game-design/constants/rpg';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';
import { PetFarmBonusCache } from '@/features/pet-farm/services/pet-farm-bonus-cache';
import { PetTraitBonusCache } from '@/features/pet-farm/services/pet-trait-bonus-cache';
import { PetRuntimeCache } from '@/features/pet/services/pet-runtime-cache';
import { getAccumulatedPrestigeBonuses } from '@/features/prestige/constants/prestige-catalog';
import { PunishmentModifierService } from '@/features/punishments/services/punishment-modifier-service';
import { useRpgStore } from '@/features/rpg/store/rpg-store';

import { roundBonusPercent } from '../utils/bonus-percent-format';
import { sumRelicBonusesFromKeys } from '../utils/relic-bonus';
import { BoosterModifierCache } from './booster-modifier-cache';

export type RewardModifiers = {
  xpPercent: number;
  coinPercent: number;
  lootLuckPercent: number;
  contractRewardPercent: number;
  contractStakeMultiplier: number;
  contractRewardMultiplier: number;
  lootBoxBonusChance: number;
};

const capBonus = (value: number): number =>
  roundBonusPercent(Math.min(GLOBAL_BONUS_CAP_PERCENT, Math.max(0, value)));

const parsePercent = (value: string): number => {
  const match = value.match(/\+(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
};

const sumPrestigeBonuses = (prestigeLevel: number) => {
  const bonuses = getAccumulatedPrestigeBonuses(prestigeLevel);
  let xp = 0;
  let coins = 0;
  let loot = 0;

  for (const bonus of bonuses) {
    const label = bonus.label.toLowerCase();
    const val = parsePercent(bonus.value);
    if (label.includes('xp')) xp += val;
    if (label.includes('moeda')) coins += val;
    if (label.includes('raro')) loot += val;
  }

  return { xp, coins, loot };
};

export const RewardModifierService = {
  getModifiersSync(): RewardModifiers {
    const prestigeLevel = useMetagameStore.getState().state?.prestigeLevel ?? 0;
    const discoveredKeys = useCollectionBookStore.getState().entries.map((e) => e.itemKey);
    const rpgRecord = useRpgStore.getState().record;
    const difficulty = useAppStore.getState().difficulty;
    const difficultyConfig = getDifficultyConfig(difficulty);

    const prestige = sumPrestigeBonuses(prestigeLevel);
    const relics = sumRelicBonusesFromKeys(discoveredKeys);

    let xpFromRpg = 0;
    let coinsFromRpg = 0;
    let lootFromRpg = 0;
    let contractFromRpg = 0;

    if (rpgRecord) {
      for (const perkKey of rpgRecord.unlockedPerks) {
        const perk = RPG_PERKS.find((entry) => entry.key === perkKey);
        if (!perk) continue;
        if (perk.bonusType === 'xp') xpFromRpg += perk.bonusValue;
        if (perk.bonusType === 'coins') coinsFromRpg += perk.bonusValue;
        if (perk.bonusType === 'loot') lootFromRpg += perk.bonusValue;
        if (perk.bonusType === 'contract') contractFromRpg += perk.bonusValue;
      }
    }

    const farmBonuses = PetFarmBonusCache.getSync();
    let petXp = farmBonuses.companionXp;
    let petCoins = farmBonuses.companionCoins;
    let petLoot = farmBonuses.companionLoot;

    if (petXp === 0 && petCoins === 0 && petLoot === 0) {
      const pet = PetRuntimeCache.get();
      if (pet?.speciesKey) {
        const species = PET_SPECIES_BY_KEY[pet.speciesKey];
        if (species) {
          if (species.passive.type === 'xp_boost') petXp += species.passive.value;
          if (species.passive.type === 'coin_boost') petCoins += species.passive.value;
          if (species.passive.type === 'loot_luck') petLoot += species.passive.value;
        }
      }
    }

    petXp += farmBonuses.pasture.xp_boost;
    petCoins += farmBonuses.pasture.coin_boost;
    petLoot += farmBonuses.pasture.loot_luck;

    const traitBonuses = PetTraitBonusCache.getSync();
    petXp += traitBonuses.xp_percent;
    petCoins += traitBonuses.coin_percent;
    petLoot += traitBonuses.loot_percent;

    const boosters = BoosterModifierCache.getSync();
    const allRelic = relics.allRewardsPercent;
    const cityVitality = useCityMapStore.getState().summary?.cityVitality ?? 100;
    const vitalityBonuses = CityVitalityService.getRewardBonuses(cityVitality);

    const xpPercent = capBonus(
      prestige.xp +
        relics.xpPercent +
        allRelic +
        xpFromRpg +
        petXp +
        boosters.xpPercent +
        vitalityBonuses.xpPercent,
    );
    const coinPercent = capBonus(
      prestige.coins +
        relics.coinPercent +
        allRelic +
        coinsFromRpg +
        petCoins +
        boosters.coinPercent +
        vitalityBonuses.coinPercent,
    );
    const lootLuckPercent = capBonus(
      prestige.loot + lootFromRpg + petLoot + boosters.lootLuckPercent,
    );

    return {
      xpPercent,
      coinPercent,
      lootLuckPercent,
      contractRewardPercent: capBonus(
        contractFromRpg + boosters.contractRewardPercent + traitBonuses.contract_percent,
      ),
      contractStakeMultiplier: difficultyConfig.contractStakeMultiplier,
      contractRewardMultiplier: difficultyConfig.contractRewardMultiplier,
      lootBoxBonusChance: difficultyConfig.lootBoxBonusChance,
    };
  },

  applyXP(base: number, modifiers?: RewardModifiers): number {
    if (base <= 0) return 0;
    const mods = modifiers ?? RewardModifierService.getModifiersSync();
    const penalties = PunishmentModifierService.getAggregatedPenalties();
    const netPercent = mods.xpPercent - penalties.xpDecayPercent;
    return Math.max(1, Math.round(base * (1 + netPercent / 100)));
  },

  applyCoins(base: number, modifiers?: RewardModifiers): number {
    if (base <= 0) return 0;
    const mods = modifiers ?? RewardModifierService.getModifiersSync();
    const penalties = PunishmentModifierService.getAggregatedPenalties();
    const netPercent = mods.coinPercent - penalties.coinDecayPercent;
    return Math.max(1, Math.round(base * (1 + netPercent / 100)));
  },

  /** Extra chance [0–1] to receive a bonus loot box when eligible. */
  rollLootBoxBonus(modifiers?: RewardModifiers): boolean {
    const mods = modifiers ?? RewardModifierService.getModifiersSync();
    if (mods.lootBoxBonusChance <= 0) return false;
    return Math.random() < mods.lootBoxBonusChance;
  },

  /** Shifts collectible roll toward higher rarities (0–1). */
  getLootLuckFactor(modifiers?: RewardModifiers): number {
    const mods = modifiers ?? RewardModifierService.getModifiersSync();
    const penalties = PunishmentModifierService.getAggregatedPenalties();
    const netPercent = mods.lootLuckPercent - penalties.lootLuckReduction;
    return Math.max(0, Math.min(0.35, netPercent / 100));
  },
};
