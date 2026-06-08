import { asc, eq } from 'drizzle-orm'

import type { LearningDifficultyValue } from '@/features/game-design/constants/difficulty'
import { LEARNING_SKILLS } from '@/features/learning-gps/constants/learning-skills'
import {
    clampSkillLevel,
    clampWorldProgress,
} from '@/features/learning-gps/utils/learning-gps-progress'
import { getDb } from '@/storage/database/client'
import {
    learningDailyPlans,
    learningWorlds,
    playerLearningProfile,
    skillLevels,
} from '@/storage/database/schema'
import {
    LearningWorldKey,
    type LearningDailyPlanRecord,
    type LearningSkillKeyValue,
    type LearningWorldKeyValue,
    type LearningWorldRecord,
    type PlayerLearningProfileRecord,
    type SkillLevelRecord,
} from '@/types/learning-gps'

const nowIso = () => new Date().toISOString()

const mapWorld = (row: typeof learningWorlds.$inferSelect): LearningWorldRecord => ({
  key: row.key as LearningWorldKeyValue,
  name: row.name,
  emoji: row.emoji,
  cefrLevel: row.cefrLevel,
  sortOrder: row.sortOrder,
  estimatedDaysMin: row.estimatedDaysMin,
  estimatedDaysMax: row.estimatedDaysMax,
  goalDescription: row.goalDescription,
  description: row.description,
})

const mapProfile = (row: typeof playerLearningProfile.$inferSelect): PlayerLearningProfileRecord => ({
  id: row.id,
  currentWorldKey: row.currentWorldKey as LearningWorldKeyValue,
  worldProgress: row.worldProgress,
  learningGpsOnboarded: row.learningGpsOnboarded,
  onboardedAt: row.onboardedAt,
  updatedAt: row.updatedAt,
})

const mapSkill = (row: typeof skillLevels.$inferSelect): SkillLevelRecord => ({
  skillKey: row.skillKey as LearningSkillKeyValue,
  level: row.level,
  updatedAt: row.updatedAt,
})

export const LearningGpsRepository = {
  async listWorlds(): Promise<LearningWorldRecord[]> {
    const db = getDb()
    const rows = await db.select().from(learningWorlds).orderBy(asc(learningWorlds.sortOrder))
    return rows.map(mapWorld)
  },

  async findWorldByKey(key: LearningWorldKeyValue): Promise<LearningWorldRecord | null> {
    const db = getDb()
    const rows = await db.select().from(learningWorlds).where(eq(learningWorlds.key, key)).limit(1)
    return rows[0] ? mapWorld(rows[0]) : null
  },

  async getOrCreateProfile(): Promise<PlayerLearningProfileRecord> {
    const db = getDb()
    const existing = await db.select().from(playerLearningProfile).where(eq(playerLearningProfile.id, 1)).limit(1)

    if (existing[0]) {
      return mapProfile(existing[0])
    }

    const createdAt = nowIso()
    await db.insert(playerLearningProfile).values({
      id: 1,
      currentWorldKey: LearningWorldKey.SURVIVOR,
      worldProgress: 0,
      learningGpsOnboarded: false,
      onboardedAt: null,
      updatedAt: createdAt,
    })

    const rows = await db.select().from(playerLearningProfile).where(eq(playerLearningProfile.id, 1)).limit(1)
    return mapProfile(rows[0]!)
  },

  async updateProfile(
    patch: Partial<Pick<PlayerLearningProfileRecord, 'currentWorldKey' | 'worldProgress' | 'learningGpsOnboarded' | 'onboardedAt'>>,
  ): Promise<PlayerLearningProfileRecord> {
    const db = getDb()
    const updatedAt = nowIso()

    await db
      .update(playerLearningProfile)
      .set({
        ...(patch.currentWorldKey !== undefined ? { currentWorldKey: patch.currentWorldKey } : {}),
        ...(patch.worldProgress !== undefined ? { worldProgress: patch.worldProgress } : {}),
        ...(patch.learningGpsOnboarded !== undefined
          ? { learningGpsOnboarded: patch.learningGpsOnboarded }
          : {}),
        ...(patch.onboardedAt !== undefined ? { onboardedAt: patch.onboardedAt } : {}),
        updatedAt,
      })
      .where(eq(playerLearningProfile.id, 1))

    return LearningGpsRepository.getOrCreateProfile()
  },

  async listSkillLevels(): Promise<SkillLevelRecord[]> {
    const db = getDb()
    const rows = await db.select().from(skillLevels)
    const byKey = new Map(rows.map((row) => [row.skillKey, mapSkill(row)]))

    return LEARNING_SKILLS.map((skill) => {
      const existing = byKey.get(skill.key)
      if (existing) return existing

      return {
        skillKey: skill.key,
        level: 0,
        updatedAt: nowIso(),
      }
    })
  },

  async ensureSkillLevels(): Promise<void> {
    const db = getDb()
    const updatedAt = nowIso()

    for (const skill of LEARNING_SKILLS) {
      await db
        .insert(skillLevels)
        .values({
          skillKey: skill.key,
          level: 0,
          updatedAt,
        })
        .onConflictDoNothing()
    }
  },

  async incrementSkillLevel(skillKey: LearningSkillKeyValue, delta: number): Promise<SkillLevelRecord> {
    const db = getDb()
    const updatedAt = nowIso()
    const current = await LearningGpsRepository.listSkillLevels()
    const existing = current.find((skill) => skill.skillKey === skillKey)
    const nextLevel = clampSkillLevel((existing?.level ?? 0) + delta)

    await db
      .insert(skillLevels)
      .values({ skillKey, level: nextLevel, updatedAt })
      .onConflictDoUpdate({
        target: skillLevels.skillKey,
        set: { level: nextLevel, updatedAt },
      })

    return { skillKey, level: nextLevel, updatedAt }
  },

  async incrementWorldProgress(delta: number): Promise<PlayerLearningProfileRecord> {
    const profile = await LearningGpsRepository.getOrCreateProfile()
    const nextProgress = clampWorldProgress(profile.worldProgress + delta)
    return LearningGpsRepository.updateProfile({ worldProgress: nextProgress })
  },

  async getOrCreateDailyPlan(
    dateKey: string,
    difficulty: LearningDifficultyValue,
  ): Promise<LearningDailyPlanRecord> {
    const db = getDb()
    const updatedAt = nowIso()

    // Upsert idempotente — evita UNIQUE quando hydrate/refresh rodam em paralelo.
    await db
      .insert(learningDailyPlans)
      .values({
        dateKey,
        difficulty,
        blockProgressJson: '{}',
        updatedAt,
      })
      .onConflictDoNothing()

    const rows = await db
      .select()
      .from(learningDailyPlans)
      .where(eq(learningDailyPlans.dateKey, dateKey))
      .limit(1)

    const row = rows[0]
    if (!row) {
      throw new Error(`Falha ao carregar plano diário para ${dateKey}.`)
    }

    return {
      dateKey: row.dateKey,
      difficulty: row.difficulty,
      blockProgress: JSON.parse(row.blockProgressJson) as LearningDailyPlanRecord['blockProgress'],
      updatedAt: row.updatedAt,
    }
  },

  async saveDailyPlanProgress(
    dateKey: string,
    difficulty: LearningDifficultyValue,
    blockProgress: LearningDailyPlanRecord['blockProgress'],
  ): Promise<LearningDailyPlanRecord> {
    const db = getDb()
    const updatedAt = nowIso()

    await db
      .insert(learningDailyPlans)
      .values({
        dateKey,
        difficulty,
        blockProgressJson: JSON.stringify(blockProgress),
        updatedAt,
      })
      .onConflictDoUpdate({
        target: learningDailyPlans.dateKey,
        set: {
          difficulty,
          blockProgressJson: JSON.stringify(blockProgress),
          updatedAt,
        },
      })

    return {
      dateKey,
      difficulty,
      blockProgress,
      updatedAt,
    }
  },
}
