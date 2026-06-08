import { eq } from 'drizzle-orm'

import { getCurriculumForWorld } from '@/features/learning-gps/catalogs/curriculum-index'
import { getDb } from '@/storage/database/client'
import { learningUnitProgress } from '@/storage/database/schema'
import {
    LearningUnitStatus,
    type LearningCurriculumUnitDefinition,
    type LearningUnitProgressRecord,
    type LearningUnitStatusValue,
    type LearningWorldKeyValue,
} from '@/types/learning-gps'

const nowIso = () => new Date().toISOString()

const mapRow = (row: typeof learningUnitProgress.$inferSelect): LearningUnitProgressRecord => ({
  unitKey: row.unitKey,
  worldKey: row.worldKey as LearningWorldKeyValue,
  status: row.status as LearningUnitStatusValue,
  practiceProgress: row.practiceProgress,
  completedAt: row.completedAt,
  updatedAt: row.updatedAt,
})

export const LearningCurriculumRepository = {
  async listAll(): Promise<LearningUnitProgressRecord[]> {
    const db = getDb()
    const rows = await db.select().from(learningUnitProgress)
    return rows.map(mapRow)
  },

  async listForWorld(worldKey: LearningWorldKeyValue): Promise<LearningUnitProgressRecord[]> {
    const db = getDb()
    const rows = await db
      .select()
      .from(learningUnitProgress)
      .where(eq(learningUnitProgress.worldKey, worldKey))

    return rows.map(mapRow)
  },

  async ensureWorldSeeded(worldKey: LearningWorldKeyValue): Promise<void> {
    const units = getCurriculumForWorld(worldKey)
    if (units.length === 0) return

    const db = getDb()
    const updatedAt = nowIso()

    for (const [index, unit] of units.entries()) {
      const status =
        index === 0 ? LearningUnitStatus.AVAILABLE : LearningUnitStatus.LOCKED

      await db
        .insert(learningUnitProgress)
        .values({
          unitKey: unit.key,
          worldKey: unit.worldKey,
          status,
          practiceProgress: 0,
          completedAt: null,
          updatedAt,
        })
        .onConflictDoNothing()
    }
  },

  async findByKey(unitKey: string): Promise<LearningUnitProgressRecord | null> {
    const db = getDb()
    const rows = await db
      .select()
      .from(learningUnitProgress)
      .where(eq(learningUnitProgress.unitKey, unitKey))
      .limit(1)

    return rows[0] ? mapRow(rows[0]) : null
  },

  async saveProgress(record: LearningUnitProgressRecord): Promise<void> {
    const db = getDb()
    const updatedAt = nowIso()

    await db
      .insert(learningUnitProgress)
      .values({
        unitKey: record.unitKey,
        worldKey: record.worldKey,
        status: record.status,
        practiceProgress: record.practiceProgress,
        completedAt: record.completedAt,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: learningUnitProgress.unitKey,
        set: {
          status: record.status,
          practiceProgress: record.practiceProgress,
          completedAt: record.completedAt,
          updatedAt,
        },
      })
  },

  async getActiveUnit(
    worldKey: LearningWorldKeyValue,
    units: LearningCurriculumUnitDefinition[],
  ): Promise<{ unit: LearningCurriculumUnitDefinition; progress: LearningUnitProgressRecord } | null> {
    const progressRows = await LearningCurriculumRepository.listForWorld(worldKey)
    const byKey = new Map(progressRows.map((row) => [row.unitKey, row]))

    for (const unit of units) {
      const progress = byKey.get(unit.key)
      if (!progress) continue
      if (
        progress.status === LearningUnitStatus.AVAILABLE ||
        progress.status === LearningUnitStatus.IN_PROGRESS
      ) {
        return { unit, progress }
      }
    }

    return null
  },
}
