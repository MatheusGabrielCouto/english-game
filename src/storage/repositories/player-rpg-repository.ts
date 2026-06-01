import { eq } from 'drizzle-orm';

import {
  DEFAULT_RPG_RECORD,
  type PlayerRpgRecord,
  type RpgAttributeValue,
} from '@/features/game-design/constants/rpg';

import { getDb } from '../database/client';
import { playerRpg } from '../database/schema';

const mapRow = (row: typeof playerRpg.$inferSelect): PlayerRpgRecord => ({
  intelligence: row.intelligence,
  discipline: row.discipline,
  communication: row.communication,
  confidence: row.confidence,
  fluency: row.fluency,
  unlockedPerks: JSON.parse(row.unlockedPerksJson) as string[],
  updatedAt: row.updatedAt,
});

export const PlayerRpgRepository = {
  async getOrCreate(): Promise<PlayerRpgRecord> {
    const db = getDb();
    const rows = await db.select().from(playerRpg).where(eq(playerRpg.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    const now = new Date().toISOString();
    await db.insert(playerRpg).values({
      id: 1,
      intelligence: 1,
      discipline: 1,
      communication: 1,
      confidence: 1,
      fluency: 1,
      unlockedPerksJson: '[]',
      updatedAt: now,
    });

    return { ...DEFAULT_RPG_RECORD, updatedAt: now };
  },

  async save(record: PlayerRpgRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(playerRpg)
      .values({
        id: 1,
        intelligence: record.intelligence,
        discipline: record.discipline,
        communication: record.communication,
        confidence: record.confidence,
        fluency: record.fluency,
        unlockedPerksJson: JSON.stringify(record.unlockedPerks),
        updatedAt: record.updatedAt,
      })
      .onConflictDoUpdate({
        target: playerRpg.id,
        set: {
          intelligence: record.intelligence,
          discipline: record.discipline,
          communication: record.communication,
          confidence: record.confidence,
          fluency: record.fluency,
          unlockedPerksJson: JSON.stringify(record.unlockedPerks),
          updatedAt: record.updatedAt,
        },
      });
  },

  async incrementAttribute(attribute: RpgAttributeValue, amount = 1): Promise<PlayerRpgRecord> {
    const current = await this.getOrCreate();
    const next = {
      ...current,
      [attribute]: current[attribute] + amount,
      updatedAt: new Date().toISOString(),
    } as PlayerRpgRecord;

    await this.save(next);
    return next;
  },

  async unlockPerk(perkKey: string): Promise<PlayerRpgRecord> {
    const current = await this.getOrCreate();
    if (current.unlockedPerks.includes(perkKey)) return current;

    const next = {
      ...current,
      unlockedPerks: [...current.unlockedPerks, perkKey],
      updatedAt: new Date().toISOString(),
    };

    await this.save(next);
    return next;
  },
};
