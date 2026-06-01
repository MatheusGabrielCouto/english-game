import { eq } from 'drizzle-orm';

import type { CityMapStateRecord } from '@/types/city-map';

import { getDb } from '../database/client';
import { cityMapState } from '../database/schema';

const DEFAULT_CITY_NAME = 'Minha Cidade';

const mapRow = (row: typeof cityMapState.$inferSelect): CityMapStateRecord => ({
  cityName: row.cityName,
  cityVitality: row.cityVitality,
  activeRumorKey: row.activeRumorKey ?? null,
  rumorUpdatedAt: row.rumorUpdatedAt ?? null,
  updatedAt: row.updatedAt,
});

export const CityMapStateRepository = {
  async getOrCreate(): Promise<CityMapStateRecord> {
    const db = getDb();
    const rows = await db.select().from(cityMapState).where(eq(cityMapState.id, 1)).limit(1);
    const existing = rows[0];

    if (existing) return mapRow(existing);

    const now = new Date().toISOString();
    await db.insert(cityMapState).values({
      id: 1,
      cityName: DEFAULT_CITY_NAME,
      cityVitality: 100,
      activeRumorKey: null,
      rumorUpdatedAt: null,
      updatedAt: now,
    });

    return {
      cityName: DEFAULT_CITY_NAME,
      cityVitality: 100,
      activeRumorKey: null,
      rumorUpdatedAt: null,
      updatedAt: now,
    };
  },

  async updateCityName(cityName: string): Promise<CityMapStateRecord> {
    const db = getDb();
    const now = new Date().toISOString();
    await db
      .insert(cityMapState)
      .values({
        id: 1,
        cityName,
        cityVitality: 100,
        activeRumorKey: null,
        rumorUpdatedAt: null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: cityMapState.id,
        set: { cityName, updatedAt: now },
      });

    return CityMapStateRepository.getOrCreate();
  },

  async adjustVitality(delta: number): Promise<CityMapStateRecord> {
    const current = await CityMapStateRepository.getOrCreate();
    const nextVitality = Math.min(100, Math.max(0, current.cityVitality + delta));
    const now = new Date().toISOString();
    const db = getDb();

    await db
      .update(cityMapState)
      .set({ cityVitality: nextVitality, updatedAt: now })
      .where(eq(cityMapState.id, 1));

    return {
      ...current,
      cityVitality: nextVitality,
      updatedAt: now,
    };
  },

  async setVitality(value: number): Promise<CityMapStateRecord> {
    const current = await CityMapStateRepository.getOrCreate();
    const nextVitality = Math.min(100, Math.max(0, value));
    const now = new Date().toISOString();
    const db = getDb();

    await db
      .update(cityMapState)
      .set({ cityVitality: nextVitality, updatedAt: now })
      .where(eq(cityMapState.id, 1));

    return {
      ...current,
      cityVitality: nextVitality,
      updatedAt: now,
    };
  },

  async setActiveRumor(rumorKey: string | null): Promise<CityMapStateRecord> {
    const current = await CityMapStateRepository.getOrCreate();
    const now = new Date().toISOString();
    const db = getDb();

    await db
      .update(cityMapState)
      .set({
        activeRumorKey: rumorKey,
        rumorUpdatedAt: rumorKey ? now : null,
        updatedAt: now,
      })
      .where(eq(cityMapState.id, 1));

    return {
      ...current,
      activeRumorKey: rumorKey,
      rumorUpdatedAt: rumorKey ? now : null,
      updatedAt: now,
    };
  },
};
