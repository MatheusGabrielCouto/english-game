import { PlayerService } from '@/features/player/services/player-service';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { GameEvents } from '@/services/game-events';
import { PetAcademyRepository } from '@/storage/repositories/pet-academy-repository';
import { PetAdventureRepository } from '@/storage/repositories/pet-adventure-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetLeagueRepository } from '@/storage/repositories/pet-league-repository';
import { PetStage } from '@/types/pet';
import type { PetInstance } from '@/types/pet-instance';
import type {
    PetLeagueBattleResult,
    PetLeagueEntry,
    PetLeagueGhost,
    PetLeagueRewardTierValue,
    PetLeagueSeasonInfo,
    PetLeagueSeasonProgress,
} from '@/types/pet-league';

import {
    computeBattleWinChance,
    computeLeagueRating,
    eligibleRewardTiers,
    generateLeagueGhosts,
    leagueWinCoins,
    PET_LEAGUE_BATTLES_PER_PET_DAY,
    PET_LEAGUE_REWARD_BY_KEY,
    resolveLeagueDivision,
} from '../catalogs/pet-league-catalog';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { PetInstanceMemoryService } from './pet-instance-memory-service';
import { PetRosterService } from './pet-roster-service';

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export const getLeagueSeasonBounds = (now = new Date()): PetLeagueSeasonInfo => {
  const d = new Date(now);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + diffToMonday);
  const end = new Date(monday);
  end.setDate(monday.getDate() + 7);
  const msLeft = end.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msLeft / 86_400_000));

  return {
    seasonKey: monday.toISOString().slice(0, 10),
    seasonStartIso: monday.toISOString(),
    seasonEndIso: end.toISOString(),
    daysRemaining,
  };
};

let ensureSeasonInFlight: Promise<PetLeagueSeasonInfo> | null = null;

const ensureSeasonMeta = async (): Promise<PetLeagueSeasonInfo> => {
  if (ensureSeasonInFlight) return ensureSeasonInFlight;

  ensureSeasonInFlight = (async () => {
    const bounds = getLeagueSeasonBounds();
    const meta = await PetLeagueRepository.getMeta();

    if (!meta || meta.seasonKey !== bounds.seasonKey) {
      await PetLeagueRepository.upsertMeta({
        seasonKey: bounds.seasonKey,
        seasonStartIso: bounds.seasonStartIso,
        claimedRewardTiers: meta?.seasonKey === bounds.seasonKey ? meta.claimedRewardTiers : [],
      });
    }

    return bounds;
  })();

  try {
    return await ensureSeasonInFlight;
  } finally {
    ensureSeasonInFlight = null;
  }
};

const resetDailyBattlesIfNeeded = (entry: PetLeagueEntry): void => {
  const day = todayIso();
  if (entry.battlesDayIso !== day) {
    entry.battlesDayIso = day;
    entry.battlesToday = 0;
  }
};

const getOrCreateEntry = async (
  instance: PetInstance,
  seasonKey: string,
): Promise<PetLeagueEntry> => {
  const existing = await PetLeagueRepository.findEntry(instance.id, seasonKey);
  if (existing) {
    resetDailyBattlesIfNeeded(existing);
    return existing;
  }

  const species = getSpeciesDefinition(instance.speciesKey);
  const division = resolveLeagueDivision(species.rarity);
  const rating = computeLeagueRating(instance, 0);
  await PetLeagueRepository.insertEntry({
    instanceId: instance.id,
    seasonKey,
    division,
    peakRating: rating,
  });

  const created = await PetLeagueRepository.findEntry(instance.id, seasonKey);
  if (created) return created;

  throw new Error('Failed to create league entry.');
};

export const PetLeagueService = {
  getSeasonBounds: getLeagueSeasonBounds,

  async ensureSeason(): Promise<PetLeagueSeasonInfo> {
    return ensureSeasonMeta();
  },

  async getSeasonProgress(): Promise<PetLeagueSeasonProgress> {
    const season = await ensureSeasonMeta();
    const meta = await PetLeagueRepository.getMeta();
    const entries = await PetLeagueRepository.listEntriesForSeason(season.seasonKey);
    const totalWins = entries.reduce((sum, e) => sum + e.wins, 0);
    const peakRating = entries.reduce((max, e) => Math.max(max, e.peakRating), 0);

    return {
      totalWins,
      peakRating,
      eligibleTiers: eligibleRewardTiers(totalWins, peakRating),
      claimedTiers: meta?.claimedRewardTiers ?? [],
    };
  },

  async hasGoldUnlock(): Promise<boolean> {
    const progress = await PetLeagueService.getSeasonProgress();
    return progress.eligibleTiers.includes('gold');
  },

  async getEntryForInstance(instanceId: number): Promise<PetLeagueEntry | null> {
    const season = await ensureSeasonMeta();
    return PetLeagueRepository.findEntry(instanceId, season.seasonKey);
  },

  async getGhosts(instanceId: number): Promise<PetLeagueGhost[]> {
    const season = await ensureSeasonMeta();
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return [];

    const entry = await getOrCreateEntry(instance, season.seasonKey);
    const rating = computeLeagueRating(instance, entry.winStreak);

    return generateLeagueGhosts({
      seasonKey: season.seasonKey,
      instanceId,
      division: entry.division,
      playerRating: rating,
    });
  },

  getRatingPreview(instance: PetInstance, winStreak: number): number {
    return computeLeagueRating(instance, winStreak);
  },

  async canBattle(instanceId: number): Promise<{ ok: boolean; message: string }> {
    await PetRosterService.ensureInitialized();
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };
    if (instance.stage === PetStage.EGG) {
      return { ok: false, message: 'Ovos não podem lutar na liga.' };
    }

    if (await PetAdventureRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Pet em aventura — espere o retorno.' };
    }

    if (await PetAcademyRepository.findActiveForInstance(instanceId)) {
      return { ok: false, message: 'Pet na academia — espere a aula.' };
    }

    if (instance.passiveFieldSlot !== null) {
      return { ok: false, message: 'Remova o pet do pasto antes de lutar.' };
    }

    if (instance.breedingPenSlot !== null) {
      return { ok: false, message: 'Pet no laboratório — libere antes de lutar.' };
    }

    const season = await ensureSeasonMeta();
    const entry = await getOrCreateEntry(instance, season.seasonKey);
    if (entry.battlesToday >= PET_LEAGUE_BATTLES_PER_PET_DAY) {
      return {
        ok: false,
        message: `Limite diário (${PET_LEAGUE_BATTLES_PER_PET_DAY} lutas por pet).`,
      };
    }

    return { ok: true, message: 'OK' };
  },

  async battle(instanceId: number, ghostId: string): Promise<PetLeagueBattleResult | null> {
    const check = await PetLeagueService.canBattle(instanceId);
    if (!check.ok) return null;

    const season = await ensureSeasonMeta();
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return null;

    const ghosts = await PetLeagueService.getGhosts(instanceId);
    const ghost = ghosts.find((g) => g.id === ghostId);
    if (!ghost) return null;

    const entry = await getOrCreateEntry(instance, season.seasonKey);
    const playerRating = computeLeagueRating(instance, entry.winStreak);
    const winChance = computeBattleWinChance(playerRating, ghost.rating);
    const won = Math.random() < winChance;

    entry.battlesToday += 1;
    entry.lastBattleAt = new Date().toISOString();
    entry.updatedAt = entry.lastBattleAt;

    let coinsEarned = 0;
    if (won) {
      entry.wins += 1;
      entry.winStreak += 1;
      coinsEarned = leagueWinCoins(entry.division);
      PlayerService.addCoins(coinsEarned);
    } else {
      entry.losses += 1;
      entry.winStreak = 0;
    }

    const afterRating = computeLeagueRating(instance, entry.winStreak);
    entry.peakRating = Math.max(entry.peakRating, afterRating, playerRating);
    await PetLeagueRepository.updateEntry(entry);

    if (entry.wins + entry.losses === 1) {
      await PetInstanceMemoryService.tryUnlock(instanceId, 'league_debut');
    }

    GameEvents.emit({
      type: 'PET_LEAGUE_BATTLE',
      instanceId,
      ghostId,
      won,
      division: entry.division,
    });

    return {
      won,
      playerRating,
      ghostRating: ghost.rating,
      winChance,
      coinsEarned,
      wins: entry.wins,
      losses: entry.losses,
      winStreak: entry.winStreak,
      peakRating: entry.peakRating,
    };
  },

  async claimSeasonReward(
    tier: PetLeagueRewardTierValue,
  ): Promise<{ ok: boolean; message: string }> {
    const def = PET_LEAGUE_REWARD_BY_KEY[tier];
    if (!def) return { ok: false, message: 'Recompensa inválida.' };

    await ensureSeasonMeta();
    const meta = await PetLeagueRepository.getMeta();
    if (!meta) return { ok: false, message: 'Liga não inicializada.' };

    if (meta.claimedRewardTiers.includes(tier)) {
      return { ok: false, message: 'Recompensa já resgatada nesta temporada.' };
    }

    const progress = await PetLeagueService.getSeasonProgress();
    if (!progress.eligibleTiers.includes(tier)) {
      return {
        ok: false,
        message: `Ainda não elegível (${def.minWins} vitórias ou rating ${def.minPeakRating}+).`,
      };
    }

    PlayerService.addCoins(def.coins);
    await StudyPointsService.earn(def.studyPoints, `Liga ${def.label}`, 'pet_league');

    if (tier === 'silver') {
      const active = await PetInstanceRepository.findActive();
      if (active) {
        const { grantLeagueSilverCosmetic } = await import('./pet-cosmetic-service');
        await grantLeagueSilverCosmetic(active.id);
      }
    }

    const claimed = [...meta.claimedRewardTiers, tier];
    await PetLeagueRepository.upsertMeta({
      seasonKey: meta.seasonKey,
      seasonStartIso: meta.seasonStartIso,
      claimedRewardTiers: claimed,
    });

    GameEvents.emit({
      type: 'PET_LEAGUE_REWARD_CLAIMED',
      tier,
      coins: def.coins,
      studyPoints: def.studyPoints,
    });

    return { ok: true, message: `${def.emoji} ${def.label} resgatado!` };
  },
};
