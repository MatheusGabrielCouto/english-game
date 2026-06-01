import { and, eq } from 'drizzle-orm';

import { getDb } from '../database/client';
import { cityPoiVisits } from '../database/schema';

export type CityPoiVisitRecord = {
  poiKey: string;
  visitDate: string;
  petVisitBonus: boolean;
  visitedAt: string;
};

const mapRow = (row: typeof cityPoiVisits.$inferSelect): CityPoiVisitRecord => ({
  poiKey: row.poiKey,
  visitDate: row.visitDate,
  petVisitBonus: row.petVisitBonus,
  visitedAt: row.visitedAt,
});

export const CityPoiVisitRepository = {
  async findByPoiAndDate(poiKey: string, visitDate: string): Promise<CityPoiVisitRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiVisits)
      .where(and(eq(cityPoiVisits.poiKey, poiKey), eq(cityPoiVisits.visitDate, visitDate)))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async upsert(params: {
    poiKey: string;
    visitDate: string;
    petVisitBonus?: boolean;
    visitedAt: string;
  }): Promise<CityPoiVisitRecord> {
    const db = getDb();
    const existing = await CityPoiVisitRepository.findByPoiAndDate(params.poiKey, params.visitDate);

    const petVisitBonus = params.petVisitBonus ?? existing?.petVisitBonus ?? false;

    await db
      .insert(cityPoiVisits)
      .values({
        poiKey: params.poiKey,
        visitDate: params.visitDate,
        petVisitBonus,
        visitedAt: params.visitedAt,
      })
      .onConflictDoUpdate({
        target: [cityPoiVisits.poiKey, cityPoiVisits.visitDate],
        set: {
          petVisitBonus,
          visitedAt: params.visitedAt,
        },
      });

    return {
      poiKey: params.poiKey,
      visitDate: params.visitDate,
      petVisitBonus,
      visitedAt: params.visitedAt,
    };
  },
};
