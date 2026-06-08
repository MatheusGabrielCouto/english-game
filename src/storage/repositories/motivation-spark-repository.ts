import { and, desc, eq, like, or, sql } from 'drizzle-orm'

import {
    inferContentKind,
    mapMotivationSparkRow,
    resolveRotationWeight,
    serializeImages,
    serializeLinks,
    serializeTags,
} from '@/features/motivation-spark/utils/motivation-mappers'
import type {
    MotivationContentKindValue,
    MotivationImportanceValue,
    MotivationLink,
    MotivationSparkListFilter,
    MotivationSparkRecord,
} from '@/types/motivation-spark'

import { getDb } from '../database/client'
import { motivationSparks } from '../database/schema'

const buildSearchClause = (search: string) => {
  const term = `%${search.trim().toLowerCase()}%`
  return or(
    like(sql`lower(${motivationSparks.title})`, term),
    like(sql`lower(${motivationSparks.body})`, term),
    like(sql`lower(${motivationSparks.tagsJson})`, term),
  )
}

export type CreateMotivationSparkRow = {
  id: string
  title: string
  body: string | null
  contentKind: MotivationContentKindValue
  images: string[]
  audioUri: string | null
  audioDurationMs: number | null
  audioTranscript: string | null
  links: MotivationLink[]
  collectionId: string | null
  tags: string[]
  importance: MotivationImportanceValue
  isFavorite: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export const MotivationSparkRepository = {
  async findById(id: string): Promise<MotivationSparkRecord | null> {
    const db = getDb()
    const rows = await db
      .select()
      .from(motivationSparks)
      .where(eq(motivationSparks.id, id))
      .limit(1)
    return rows[0] ? mapMotivationSparkRow(rows[0]) : null
  },

  async list(filter: MotivationSparkListFilter = {}): Promise<MotivationSparkRecord[]> {
    const db = getDb()
    const conditions = []

    if (filter.archivedOnly) {
      conditions.push(eq(motivationSparks.isArchived, true))
    } else if (!filter.includeArchived) {
      conditions.push(eq(motivationSparks.isArchived, false))
    }
    if (filter.favoritesOnly) {
      conditions.push(eq(motivationSparks.isFavorite, true))
    }
    if (filter.pinnedOnly) {
      conditions.push(eq(motivationSparks.isPinned, true))
    }
    if (filter.collectionId) {
      conditions.push(eq(motivationSparks.collectionId, filter.collectionId))
    }
    if (filter.search?.trim()) {
      conditions.push(buildSearchClause(filter.search)!)
    }

    const rows = await db
      .select()
      .from(motivationSparks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(motivationSparks.isPinned), desc(motivationSparks.updatedAt))

    return rows.map(mapMotivationSparkRow)
  },

  async listActive(): Promise<MotivationSparkRecord[]> {
    return MotivationSparkRepository.list()
  },

  async insert(spark: CreateMotivationSparkRow): Promise<void> {
    const db = getDb()
    const rotationWeight = resolveRotationWeight(spark)

    await db.insert(motivationSparks).values({
      id: spark.id,
      title: spark.title,
      body: spark.body,
      contentKind: spark.contentKind,
      imagesJson: serializeImages(spark.images),
      audioUri: spark.audioUri,
      audioDurationMs: spark.audioDurationMs,
      audioTranscript: spark.audioTranscript,
      linksJson: serializeLinks(spark.links),
      collectionId: spark.collectionId,
      tagsJson: serializeTags(spark.tags),
      importance: spark.importance,
      isFavorite: spark.isFavorite,
      isPinned: spark.isPinned,
      isArchived: false,
      rotationWeight,
      lastShownAt: null,
      showCount: 0,
      createdAt: spark.createdAt,
      updatedAt: spark.updatedAt,
    })
  },

  async update(
    id: string,
    patch: Partial<{
      title: string
      body: string | null
      contentKind: MotivationContentKindValue
      images: string[]
      audioUri: string | null
      audioDurationMs: number | null
      audioTranscript: string | null
      links: MotivationLink[]
      collectionId: string | null
      tags: string[]
      importance: MotivationImportanceValue
      isFavorite: boolean
      isPinned: boolean
      isArchived: boolean
      rotationWeight: number
      lastShownAt: string | null
      showCount: number
      updatedAt: string
    }>,
  ): Promise<void> {
    const db = getDb()
    const { tags, images, links, ...rest } = patch

    await db
      .update(motivationSparks)
      .set({
        ...rest,
        ...(tags != null ? { tagsJson: serializeTags(tags) } : {}),
        ...(images != null ? { imagesJson: serializeImages(images) } : {}),
        ...(links != null ? { linksJson: serializeLinks(links) } : {}),
      })
      .where(eq(motivationSparks.id, id))
  },

  async delete(id: string): Promise<void> {
    const db = getDb()
    await db.delete(motivationSparks).where(eq(motivationSparks.id, id))
  },

  async clearCollectionId(collectionId: string): Promise<void> {
    const db = getDb()
    await db
      .update(motivationSparks)
      .set({ collectionId: null })
      .where(eq(motivationSparks.collectionId, collectionId))
  },

  async countActive(): Promise<number> {
    const db = getDb()
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(motivationSparks)
      .where(eq(motivationSparks.isArchived, false))
    return Number(rows[0]?.count ?? 0)
  },

  async countArchived(): Promise<number> {
    const db = getDb()
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(motivationSparks)
      .where(eq(motivationSparks.isArchived, true))
    return Number(rows[0]?.count ?? 0)
  },
}

export const buildCreateMotivationSparkRow = (
  input: Omit<CreateMotivationSparkRow, 'contentKind' | 'rotationWeight'> & {
    contentKind?: MotivationContentKindValue
  },
): CreateMotivationSparkRow => ({
  ...input,
  contentKind:
    input.contentKind ??
    inferContentKind({
      body: input.body,
      images: input.images,
      audioUri: input.audioUri,
      links: input.links,
    }),
})
