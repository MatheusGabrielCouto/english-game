import type { motivationSparks } from '@/storage/database/schema'
import type {
    MotivationContentKindValue,
    MotivationImportanceValue,
    MotivationLink,
    MotivationSparkRecord,
} from '@/types/motivation-spark'

export const parseTagsJson = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
  } catch {
    return []
  }
}

export const serializeTags = (tags: string[]): string => JSON.stringify(tags)

export const parseImagesJson = (raw: string | null | undefined): string[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((uri): uri is string => typeof uri === 'string' && uri.length > 0)
  } catch {
    return []
  }
}

export const serializeImages = (images: string[]): string => JSON.stringify(images)

export const parseLinksJson = (raw: string): MotivationLink[] => {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is MotivationLink => {
        if (!item || typeof item !== 'object') return false
        const link = item as MotivationLink
        return typeof link.url === 'string' && link.url.length > 0
      })
      .map((link) => ({
        url: link.url,
        title: typeof link.title === 'string' ? link.title : null,
        description: typeof link.description === 'string' ? link.description : null,
      }))
  } catch {
    return []
  }
}

export const serializeLinks = (links: MotivationLink[]): string => JSON.stringify(links)

export const mapMotivationSparkRow = (
  row: typeof motivationSparks.$inferSelect,
): MotivationSparkRecord => ({
  id: row.id,
  title: row.title,
  body: row.body,
  contentKind: row.contentKind as MotivationContentKindValue,
  images: parseImagesJson(row.imagesJson),
  audioUri: row.audioUri,
  audioDurationMs: row.audioDurationMs,
  audioTranscript: row.audioTranscript,
  links: parseLinksJson(row.linksJson),
  collectionId: row.collectionId,
  tags: parseTagsJson(row.tagsJson),
  importance: row.importance as MotivationImportanceValue,
  isFavorite: row.isFavorite,
  isPinned: row.isPinned,
  isArchived: row.isArchived,
  rotationWeight: row.rotationWeight,
  lastShownAt: row.lastShownAt,
  showCount: row.showCount,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export const resolveRotationWeight = (spark: {
  isPinned: boolean
  isFavorite: boolean
  importance: MotivationImportanceValue
}): number => {
  let weight = 1
  if (spark.isPinned) weight += 3
  if (spark.isFavorite) weight += 2
  if (spark.importance === 'high') weight += 1
  return weight
}

export const inferContentKind = (input: {
  body?: string | null
  images?: string[]
  audioUri?: string | null
  links?: MotivationLink[]
}): MotivationContentKindValue => {
  const hasBody = Boolean(input.body?.trim())
  const hasImages = (input.images?.length ?? 0) > 0
  const hasAudio = Boolean(input.audioUri)
  const hasLinks = (input.links?.length ?? 0) > 0
  const kindCount = [hasBody, hasImages, hasAudio, hasLinks].filter(Boolean).length

  if (kindCount > 1) return 'mixed'
  if (hasImages) return 'image'
  if (hasAudio) return 'audio'
  if (hasLinks) return 'link'
  return 'text'
}
