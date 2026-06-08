import type { MotivationSparkRecord } from '@/types/motivation-spark'

const SNIPPET_MAX_LENGTH = 120

export const stripMarkdown = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const truncateSnippet = (text: string, maxLength = SNIPPET_MAX_LENGTH): string => {
  const normalized = text.trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export const buildMotivationNotificationSnippet = (spark: MotivationSparkRecord): string => {
  if (spark.body?.trim()) {
    return truncateSnippet(stripMarkdown(spark.body))
  }
  if (spark.audioTranscript?.trim()) {
    return truncateSnippet(spark.audioTranscript)
  }
  if (spark.links[0]) {
    return truncateSnippet(spark.links[0].title?.trim() || spark.links[0].url)
  }
  if (spark.images.length > 0) {
    return spark.title
  }
  return spark.title
}
