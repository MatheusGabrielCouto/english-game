import { GameEvents } from '@/services/game-events';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetLeagueRepository } from '@/storage/repositories/pet-league-repository';
import { PetFavoriteTag, type PetFavoriteTagValue, type PetInstance } from '@/types/pet-instance';
import { PetHallCategoryKey, type PetHallPedestal } from '@/types/pet-hall';

import {
  PET_HALL_CATEGORIES,
  PET_HALL_CATEGORY_BY_SLOT,
  sumPetStats,
} from '../catalogs/pet-hall-catalog';
import { PetInstanceMemoryService } from './pet-instance-memory-service';

type LeaderContext = {
  instances: PetInstance[];
  leagueWins: Map<number, number>;
};

const metricFor = (
  instance: PetInstance,
  categoryKey: string,
  leagueWins: Map<number, number>,
): string => {
  switch (categoryKey) {
    case PetHallCategoryKey.HIGHEST_GEN:
      return `GEN ${instance.generation}`;
    case PetHallCategoryKey.HIGHEST_LEVEL:
      return `Nv. ${instance.level}`;
    case PetHallCategoryKey.HIGHEST_STATS:
      return `${sumPetStats(instance.stats)} stats`;
    case PetHallCategoryKey.OLDEST:
      return new Date(instance.createdAt).toLocaleDateString('pt-BR');
    case PetHallCategoryKey.MOST_ADVENTURES:
      return `${instance.totalAdventures} expedições`;
    case PetHallCategoryKey.MOST_LEAGUE_WINS:
      return `${leagueWins.get(instance.id) ?? 0} vitórias`;
    default:
      return instance.nickname;
  }
};

const scoreFor = (
  instance: PetInstance,
  categoryKey: string,
  leagueWins: Map<number, number>,
): number => {
  switch (categoryKey) {
    case PetHallCategoryKey.HIGHEST_GEN:
      return instance.generation;
    case PetHallCategoryKey.HIGHEST_LEVEL:
      return instance.level;
    case PetHallCategoryKey.HIGHEST_STATS:
      return sumPetStats(instance.stats);
    case PetHallCategoryKey.OLDEST:
      return -new Date(instance.createdAt).getTime();
    case PetHallCategoryKey.MOST_ADVENTURES:
      return instance.totalAdventures;
    case PetHallCategoryKey.MOST_LEAGUE_WINS:
      return leagueWins.get(instance.id) ?? 0;
    default:
      return 0;
  }
};

const pickLeader = (
  categoryKey: string,
  ctx: LeaderContext,
): PetInstance | null => {
  if (ctx.instances.length === 0) return null;

  let best: PetInstance | null = null;
  let bestScore = -Infinity;

  for (const instance of ctx.instances) {
    const score = scoreFor(instance, categoryKey, ctx.leagueWins);
    if (score > bestScore) {
      bestScore = score;
      best = instance;
    }
  }

  if (categoryKey === PetHallCategoryKey.MOST_ADVENTURES && best && best.totalAdventures === 0) {
    return null;
  }
  if (categoryKey === PetHallCategoryKey.MOST_LEAGUE_WINS && best) {
    const wins = ctx.leagueWins.get(best.id) ?? 0;
    if (wins === 0) return null;
  }

  return best;
};

const buildContext = async (): Promise<LeaderContext> => {
  const [instances, leagueWins] = await Promise.all([
    PetInstanceRepository.listAll(),
    PetLeagueRepository.sumWinsByInstance(),
  ]);
  return { instances, leagueWins };
};

export const PetHallService = {
  async getPedestals(): Promise<PetHallPedestal[]> {
    const ctx = await buildContext();

    return PET_HALL_CATEGORIES.map((category) => {
      const assigned = ctx.instances.find((i) => i.hallOfFameSlot === category.slot) ?? null;
      const suggested = pickLeader(category.key, ctx);
      const display = assigned ?? suggested;

      return {
        slot: category.slot,
        categoryKey: category.key,
        categoryLabel: category.label,
        categoryEmoji: category.emoji,
        instance: assigned,
        suggestedInstance: assigned ? null : suggested,
        metricLabel: display
          ? metricFor(display, category.key, ctx.leagueWins)
          : '—',
      };
    });
  },

  async assignToSlot(instanceId: number, slot: number): Promise<{ ok: boolean; message: string }> {
    const category = PET_HALL_CATEGORY_BY_SLOT[slot];
    if (!category) return { ok: false, message: 'Pedestal inválido.' };

    const target = await PetInstanceRepository.findById(instanceId);
    if (!target) return { ok: false, message: 'Pet não encontrado.' };

    const all = await PetInstanceRepository.listAll();
    for (const pet of all) {
      if (pet.hallOfFameSlot === slot && pet.id !== instanceId) {
        pet.hallOfFameSlot = null;
        await PetInstanceRepository.update(pet);
      }
      if (pet.id === instanceId) {
        pet.hallOfFameSlot = slot;
        await PetInstanceRepository.update(pet);
      }
    }

    await PetInstanceMemoryService.tryUnlock(instanceId, 'hall_inducted');
    GameEvents.emit({ type: 'PET_HALL_INDUCTED', instanceId, slot });

    return { ok: true, message: `${target.nickname} no pedestal ${category.label}.` };
  },

  async removeFromSlot(slot: number): Promise<{ ok: boolean; message: string }> {
    const all = await PetInstanceRepository.listAll();
    const occupant = all.find((i) => i.hallOfFameSlot === slot);
    if (!occupant) return { ok: false, message: 'Pedestal já está vazio.' };

    occupant.hallOfFameSlot = null;
    await PetInstanceRepository.update(occupant);
    return { ok: true, message: `${occupant.nickname} saiu do Hall.` };
  },

  async autoFillHall(): Promise<{ ok: boolean; message: string; count: number }> {
    const ctx = await buildContext();
    let count = 0;

    for (const category of PET_HALL_CATEGORIES) {
      const already = ctx.instances.find((i) => i.hallOfFameSlot === category.slot);
      if (already) continue;

      const leader = pickLeader(category.key, ctx);
      if (!leader) continue;

      const result = await PetHallService.assignToSlot(leader.id, category.slot);
      if (result.ok) count += 1;
    }

    return {
      ok: true,
      count,
      message: count > 0 ? `${count} pets induzidos!` : 'Nenhum candidato novo encontrado.',
    };
  },

  async setFavoriteTag(
    instanceId: number,
    tag: PetFavoriteTagValue,
  ): Promise<{ ok: boolean; message: string }> {
    const instance = await PetInstanceRepository.findById(instanceId);
    if (!instance) return { ok: false, message: 'Pet não encontrado.' };

    const next =
      instance.favoriteTag === tag && tag !== PetFavoriteTag.NONE ? PetFavoriteTag.NONE : tag;
    instance.favoriteTag = next;
    await PetInstanceRepository.update(instance);

    GameEvents.emit({ type: 'PET_FAVORITE_CHANGED', instanceId, tag: next });

    return { ok: true, message: next === PetFavoriteTag.NONE ? 'Marca removida.' : 'Marca atualizada!' };
  },
};
