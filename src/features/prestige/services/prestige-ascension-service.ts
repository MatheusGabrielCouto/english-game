import { useAppStore } from '@/features/app/store/app-store';
import { COLLECTIBLE_BY_KEY } from '@/features/game-design/catalogs/collectible-catalog';
import { CollectionBookService } from '@/features/collection-book/services/collection-book-service';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';
import { grantLootBoxReward } from '@/features/loot-boxes/services/loot-box-grant';
import { PRESTIGE_TIERS } from '@/features/metagame/constants/prestige-tiers';
import {
  getPrestigeLootBoxRarity,
  getPrestigeTier,
} from '@/features/prestige/constants/prestige-catalog';
import { usePlayerStore } from '@/features/player/store/player-store';
import { PetService } from '@/features/pet/services/pet-service';
import { TitleService } from '@/features/titles/services/title-service';
import { GameEvents } from '@/services/game-events';
import { ContractRunRepository } from '@/storage/repositories/contract-run-repository';
import { getMetagameState, recordLegacyMilestone, saveMetagameState } from '@/storage/repositories/metagame-repository';
import { getOrCreatePet, savePet } from '@/storage/repositories/pet-repository';
import { getOrCreatePlayer, savePlayer } from '@/storage/repositories/player-repository';
import { LegacyCategory } from '@/types/metagame';
import { PetMood, PetStage, type Pet } from '@/types/pet';
import {
  PrestigeSacrificeType,
  type PrestigeAscensionPreview,
  type PrestigeAscensionResult,
  type PrestigeSacrificeValue,
} from '@/types/prestige';

const isValidSacrifice = (value: string): value is PrestigeSacrificeValue =>
  value === PrestigeSacrificeType.COINS || value === PrestigeSacrificeType.PET;

export const PrestigeAscensionService = {
  async buildPreview(): Promise<PrestigeAscensionPreview> {
    const [player, pet] = await Promise.all([getOrCreatePlayer(), getOrCreatePet()]);

    return {
      playerLevel: player.level,
      playerXp: player.xp,
      coins: player.coins,
      currentStreak: player.currentStreak,
      petLevel: pet.level,
      petStage: pet.stage,
      petName: pet.name,
    };
  },

  async validateAscension(): Promise<PrestigeAscensionResult | { success: true }> {
    const player = usePlayerStore.getState();
    const state = (await getMetagameState()) ?? null;
    if (!state) return { success: false, reason: 'requirements' };

    const nextTier = PRESTIGE_TIERS.find((tier) => tier.level === state.prestigeLevel + 1);
    if (!nextTier) return { success: false, reason: 'max_prestige' };
    if (player.level < nextTier.requiredLevel) return { success: false, reason: 'requirements' };

    const activeContract = await ContractRunRepository.findActive();
    if (activeContract) return { success: false, reason: 'active_contract' };

    return { success: true };
  },

  async applyMandatoryReset(sacrifice: PrestigeSacrificeValue): Promise<void> {
    const player = await getOrCreatePlayer();

    const nextPlayer = {
      ...player,
      level: 1,
      xp: 0,
      coins: sacrifice === PrestigeSacrificeType.COINS ? 0 : player.coins,
    };

    await savePlayer(nextPlayer);
    usePlayerStore.setState({
      level: nextPlayer.level,
      xp: nextPlayer.xp,
      coins: nextPlayer.coins,
    });

    if (sacrifice === PrestigeSacrificeType.PET) {
      const pet = await getOrCreatePet();
      const resetPet: Pet = {
        ...pet,
        level: 1,
        experience: 0,
        stage: PetStage.BABY,
        mood: PetMood.NORMAL,
        affinity: Math.floor(pet.affinity / 2),
        isIncubating: false,
        hatchAt: null,
      };
      await savePet(resetPet);
      PetService.setCachedPet(resetPet);
    }
  },

  async ascend(sacrifice: PrestigeSacrificeValue): Promise<PrestigeAscensionResult> {
    if (!isValidSacrifice(sacrifice)) {
      return { success: false, reason: 'invalid_sacrifice' };
    }

    const validation = await PrestigeAscensionService.validateAscension();
    if (!validation.success) return validation;

    const playerBefore = await getOrCreatePlayer();
    const state = (await getMetagameState())!;
    const nextTier = PRESTIGE_TIERS.find((tier) => tier.level === state.prestigeLevel + 1)!;
    const nextPrestige = state.prestigeLevel + 1;
    const tierDef = getPrestigeTier(nextPrestige);
    if (!tierDef) return { success: false, reason: 'requirements' };

    await PrestigeAscensionService.applyMandatoryReset(sacrifice);

    await saveMetagameState({
      ...state,
      prestigeLevel: nextPrestige,
      updatedAt: new Date().toISOString(),
    });

    useAppStore.getState().setAvatarFrame(tierDef.frameKey);

    const coinReward = 200 * nextTier.level;
    usePlayerStore.getState().addCoins(coinReward);

    const lootRarity = getPrestigeLootBoxRarity(nextPrestige);
    await grantLootBoxReward(lootRarity, 'prestige');
    if (nextPrestige >= 4) {
      await grantLootBoxReward(lootRarity, 'prestige');
    }

    for (const item of tierDef.exclusiveItems) {
      if (item.category === 'title') {
        await TitleService.grantTitleByKey(item.key, true);
        continue;
      }

      if (COLLECTIBLE_BY_KEY[item.key]) {
        await CollectionBookService.discover(item.key);
      }
    }

    const sacrificeLabel =
      sacrifice === PrestigeSacrificeType.COINS ? 'moedas zeradas' : 'progresso do pet reiniciado';

    await recordLegacyMilestone({
      milestoneKey: `prestige_ascension_${nextPrestige}`,
      category: LegacyCategory.ORIGIN,
      title: `Ascensão ${tierDef.roman} — ${tierDef.name}`,
      description: `Run encerrada no nível ${playerBefore.level} (${playerBefore.coins} moedas). Sacrifício: ${sacrificeLabel}. Streak ${playerBefore.currentStreak} preservada.`,
      occurredAt: new Date().toISOString(),
    });

    GameEvents.emit({
      type: 'PRESTIGE_ASCENDED',
      tierLevel: nextPrestige,
      tierName: tierDef.name,
      tierRoman: tierDef.roman,
      sacrifice,
      previousPlayerLevel: playerBefore.level,
    });

    useFeedbackStore.getState().setPrestigeCelebration({
      tierLevel: nextPrestige,
      tierName: tierDef.name,
      tierRoman: tierDef.roman,
      sacrifice,
      permanentBonuses: tierDef.permanentBonuses.map((b) => `${b.label} ${b.value}`),
    });

    return {
      success: true,
      tierLevel: nextPrestige,
      tierName: tierDef.name,
      tierRoman: tierDef.roman,
    };
  },
};
