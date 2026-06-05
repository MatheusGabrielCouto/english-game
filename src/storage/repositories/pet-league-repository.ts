import { and, eq } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { petLeagueEntries, petLeagueMeta } from '@/storage/database/schema';
import type {
    PetLeagueDivisionValue,
    PetLeagueEntry,
    PetLeagueMeta,
    PetLeagueRewardTierValue,
} from '@/types/pet-league';

const META_ROW_ID = 1;

const parseClaimedTiers = (json: string): PetLeagueRewardTierValue[] => {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is PetLeagueRewardTierValue => typeof t === 'string');
  } catch {
    return [];
  }
};

const mapEntry = (row: typeof petLeagueEntries.$inferSelect): PetLeagueEntry => ({
  id: row.id,
  instanceId: row.instanceId,
  seasonKey: row.seasonKey,
  division: row.division as PetLeagueDivisionValue,
  wins: row.wins,
  losses: row.losses,
  winStreak: row.winStreak,
  peakRating: row.peakRating,
  battlesToday: row.battlesToday,
  battlesDayIso: row.battlesDayIso,
  lastBattleAt: row.lastBattleAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapMeta = (row: typeof petLeagueMeta.$inferSelect): PetLeagueMeta => ({
  id: row.id,
  seasonKey: row.seasonKey,
  seasonStartIso: row.seasonStartIso,
  claimedRewardTiers: parseClaimedTiers(row.claimedRewardTiersJson),
  updatedAt: row.updatedAt,
});

export const PetLeagueRepository = {
  async getMeta(): Promise<PetLeagueMeta | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petLeagueMeta)
      .where(eq(petLeagueMeta.id, META_ROW_ID))
      .limit(1);
    return rows[0] ? mapMeta(rows[0]) : null;
  },

  async upsertMeta(input: {
    seasonKey: string;
    seasonStartIso: string;
    claimedRewardTiers: PetLeagueRewardTierValue[];
  }): Promise<void> {
    const db = getDb();
    const now = new Date().toISOString();
    const values = {
      id: META_ROW_ID,
      seasonKey: input.seasonKey,
      seasonStartIso: input.seasonStartIso,
      claimedRewardTiersJson: JSON.stringify(input.claimedRewardTiers),
      updatedAt: now,
    };

    await db
      .insert(petLeagueMeta)
      .values(values)
      .onConflictDoUpdate({
        target: petLeagueMeta.id,
        set: {
          seasonKey: values.seasonKey,
          seasonStartIso: values.seasonStartIso,
          claimedRewardTiersJson: values.claimedRewardTiersJson,
          updatedAt: values.updatedAt,
        },
      });
  },

  async listEntriesForSeason(seasonKey: string): Promise<PetLeagueEntry[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petLeagueEntries)
      .where(eq(petLeagueEntries.seasonKey, seasonKey));
    return rows.map(mapEntry);
  },

  async findEntry(instanceId: number, seasonKey: string): Promise<PetLeagueEntry | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petLeagueEntries)
      .where(
        and(
          eq(petLeagueEntries.instanceId, instanceId),
          eq(petLeagueEntries.seasonKey, seasonKey),
        ),
      )
      .limit(1);
    return rows[0] ? mapEntry(rows[0]) : null;
  },

  async insertEntry(input: {
    instanceId: number;
    seasonKey: string;
    division: PetLeagueDivisionValue;
    peakRating: number;
  }): Promise<number> {
    const db = getDb();
    const now = new Date().toISOString();
    const rows = await db
      .insert(petLeagueEntries)
      .values({
        instanceId: input.instanceId,
        seasonKey: input.seasonKey,
        division: input.division,
        wins: 0,
        losses: 0,
        winStreak: 0,
        peakRating: input.peakRating,
        battlesToday: 0,
        battlesDayIso: null,
        lastBattleAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return rows[0].id;
  },

  async updateEntry(entry: PetLeagueEntry): Promise<void> {
    const db = getDb();
    await db
      .update(petLeagueEntries)
      .set({
        wins: entry.wins,
        losses: entry.losses,
        winStreak: entry.winStreak,
        peakRating: entry.peakRating,
        battlesToday: entry.battlesToday,
        battlesDayIso: entry.battlesDayIso,
        lastBattleAt: entry.lastBattleAt,
        updatedAt: entry.updatedAt,
      })
      .where(eq(petLeagueEntries.id, entry.id));
  },

  async sumWinsByInstance(): Promise<Map<number, number>> {
    const db = getDb();
    const rows = await db.select().from(petLeagueEntries);
    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(row.instanceId, (map.get(row.instanceId) ?? 0) + row.wins);
    }
    return map;
  },
};
