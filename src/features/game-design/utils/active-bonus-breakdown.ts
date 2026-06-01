import { useAppStore } from '@/features/app/store/app-store';
import { useCollectionBookStore } from '@/features/collection-book/store/collection-book-store';
import { COLLECTIBLE_BY_KEY } from '@/features/game-design/catalogs/collectible-catalog';
import { PET_SPECIES_BY_KEY } from '@/features/game-design/catalogs/pet-species-catalog';
import { GLOBAL_BONUS_CAP_PERCENT } from '@/features/game-design/constants/balance';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { RPG_PERKS } from '@/features/game-design/constants/rpg';
import { BoosterModifierCache } from '@/features/game-design/services/booster-modifier-cache';
import {
  RewardModifierService,
  type RewardModifiers,
} from '@/features/game-design/services/reward-modifier-service';
import { sumRelicBonusesFromKeys } from '@/features/game-design/utils/relic-bonus';
import { getAccumulatedPrestigeBonuses } from '@/features/prestige/constants/prestige-catalog';
import { useMetagameStore } from '@/features/metagame/store/metagame-store';
import { PetRuntimeCache } from '@/features/pet/services/pet-runtime-cache';
import { useRpgStore } from '@/features/rpg/store/rpg-store';

export type BonusContribution = {
  id: string;
  emoji: string;
  label: string;
  detail?: string;
  xp?: number;
  coins?: number;
  loot?: number;
  lootBoxChance?: number;
};

export type ActiveBonusBreakdown = {
  modifiers: RewardModifiers;
  contributions: BonusContribution[];
  rawTotals: { xp: number; coins: number; loot: number };
  isCapped: { xp: boolean; coins: boolean; loot: boolean };
};

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

const parseCollectibleBonus = (passiveBonus: string) => {
  const flat = parsePercent(passiveBonus);
  if (!flat) return null;

  const affectsXp = passiveBonus.includes('XP') || passiveBonus.includes('todas recompensas');
  const affectsCoins = passiveBonus.includes('moedas') || passiveBonus.includes('todas recompensas');
  const affectsLoot = passiveBonus.includes('Loot') || passiveBonus.includes('raro');

  if (!affectsXp && !affectsCoins && !affectsLoot) return null;

  return {
    xp: affectsXp ? flat : undefined,
    coins: affectsCoins ? flat : undefined,
    loot: affectsLoot ? flat : undefined,
  };
};

export const buildActiveBonusBreakdown = (): ActiveBonusBreakdown => {
  const prestigeLevel = useMetagameStore.getState().state?.prestigeLevel ?? 0;
  const discoveredKeys = useCollectionBookStore.getState().entries.map((entry) => entry.itemKey);
  const rpgRecord = useRpgStore.getState().record;
  const difficulty = useAppStore.getState().difficulty;
  const difficultyConfig = getDifficultyConfig(difficulty);

  const contributions: BonusContribution[] = [];
  const prestige = sumPrestigeBonuses(prestigeLevel);

  if (prestigeLevel > 0 && (prestige.xp > 0 || prestige.coins > 0 || prestige.loot > 0)) {
    contributions.push({
      id: 'prestige',
      emoji: '⭐',
      label: `Prestígio ${prestigeLevel}`,
      detail: 'Bônus permanentes acumulados dos tiers de prestígio.',
      xp: prestige.xp || undefined,
      coins: prestige.coins || undefined,
      loot: prestige.loot || undefined,
    });
  }

  for (const key of discoveredKeys) {
    const item = COLLECTIBLE_BY_KEY[key];
    if (!item?.passiveBonus) continue;

    const parsed = parseCollectibleBonus(item.passiveBonus);
    if (!parsed) continue;

    contributions.push({
      id: `collectible-${key}`,
      emoji: item.icon,
      label: item.name,
      detail: item.passiveBonus,
      ...parsed,
    });
  }

  if (rpgRecord) {
    for (const perkKey of rpgRecord.unlockedPerks) {
      const perk = RPG_PERKS.find((entry) => entry.key === perkKey);
      if (!perk || perk.bonusType === 'streak' || perk.bonusType === 'contract') continue;

      contributions.push({
        id: `perk-${perk.key}`,
        emoji: '🎭',
        label: perk.name,
        detail: perk.description,
        xp: perk.bonusType === 'xp' ? perk.bonusValue : undefined,
        coins: perk.bonusType === 'coins' ? perk.bonusValue : undefined,
        loot: perk.bonusType === 'loot' ? perk.bonusValue : undefined,
      });
    }
  }

  const pet = PetRuntimeCache.get();
  if (pet?.speciesKey) {
    const species = PET_SPECIES_BY_KEY[pet.speciesKey];
    if (species) {
      const { passive } = species;
      contributions.push({
        id: `pet-${pet.speciesKey}`,
        emoji: species.emoji,
        label: `Pet · ${species.name}`,
        detail: passive.label,
        xp: passive.type === 'xp_boost' ? passive.value : undefined,
        coins: passive.type === 'coin_boost' ? passive.value : undefined,
        loot: passive.type === 'loot_luck' ? passive.value : undefined,
      });
    }
  }

  const boosters = BoosterModifierCache.getSync();
  for (const active of boosters.active) {
    const hasBonus =
      active.xpPercent > 0 ||
      active.coinPercent > 0 ||
      active.lootLuckPercent > 0 ||
      active.contractRewardPercent > 0;
    if (!hasBonus) continue;

    const expires = new Date(active.expiresAt);
    const minsLeft = Math.max(0, Math.round((expires.getTime() - Date.now()) / 60_000));

    contributions.push({
      id: `booster-${active.boosterKey}`,
      emoji: active.icon,
      label: active.name,
      detail: minsLeft > 0 ? `Ativo · ${minsLeft} min restantes` : 'Ativo',
      xp: active.xpPercent || undefined,
      coins: active.coinPercent || undefined,
      loot: active.lootLuckPercent || undefined,
    });
  }

  if (difficultyConfig.lootBoxBonusChance > 0) {
    contributions.push({
      id: 'difficulty-loot-box',
      emoji: '🎯',
      label: `Dificuldade · ${difficultyConfig.label}`,
      detail:
        'Ao receber uma loot box, há chance de ganhar uma caixa Incomum extra. Ajuste em Perfil → Dificuldade.',
      lootBoxChance: difficultyConfig.lootBoxBonusChance,
    });
  }

  const relics = sumRelicBonusesFromKeys(discoveredKeys);
  let xpFromRpg = 0;
  let coinsFromRpg = 0;
  let lootFromRpg = 0;

  if (rpgRecord) {
    for (const perkKey of rpgRecord.unlockedPerks) {
      const perk = RPG_PERKS.find((entry) => entry.key === perkKey);
      if (!perk) continue;
      if (perk.bonusType === 'xp') xpFromRpg += perk.bonusValue;
      if (perk.bonusType === 'coins') coinsFromRpg += perk.bonusValue;
      if (perk.bonusType === 'loot') lootFromRpg += perk.bonusValue;
    }
  }

  let petXp = 0;
  let petCoins = 0;
  let petLoot = 0;
  if (pet?.speciesKey) {
    const species = PET_SPECIES_BY_KEY[pet.speciesKey];
    if (species) {
      if (species.passive.type === 'xp_boost') petXp += species.passive.value;
      if (species.passive.type === 'coin_boost') petCoins += species.passive.value;
      if (species.passive.type === 'loot_luck') petLoot += species.passive.value;
    }
  }

  const allRelic = relics.allRewardsPercent;
  const rawXp = prestige.xp + relics.xpPercent + allRelic + xpFromRpg + petXp + boosters.xpPercent;
  const rawCoins =
    prestige.coins + relics.coinPercent + allRelic + coinsFromRpg + petCoins + boosters.coinPercent;
  const rawLoot = prestige.loot + lootFromRpg + petLoot + boosters.lootLuckPercent;

  const modifiers = RewardModifierService.getModifiersSync();

  return {
    modifiers,
    contributions,
    rawTotals: { xp: rawXp, coins: rawCoins, loot: rawLoot },
    isCapped: {
      xp: rawXp > GLOBAL_BONUS_CAP_PERCENT,
      coins: rawCoins > GLOBAL_BONUS_CAP_PERCENT,
      loot: rawLoot > GLOBAL_BONUS_CAP_PERCENT,
    },
  };
};

export const formatBonusPercent = (value: number): string => `+${value}%`;

export const formatLootBoxChance = (chance: number): string => `${Math.round(chance * 100)}%`;

const formatContributionValues = (contribution: BonusContribution): string => {
  if (contribution.lootBoxChance != null) {
    return formatLootBoxChance(contribution.lootBoxChance);
  }

  const parts: string[] = [];
  if (contribution.xp) parts.push(`XP ${formatBonusPercent(contribution.xp)}`);
  if (contribution.coins) parts.push(`Moedas ${formatBonusPercent(contribution.coins)}`);
  if (contribution.loot) parts.push(`Loot ${formatBonusPercent(contribution.loot)}`);
  return parts.join(' · ');
};

export const getContributionSummary = (contribution: BonusContribution): string =>
  formatContributionValues(contribution);
