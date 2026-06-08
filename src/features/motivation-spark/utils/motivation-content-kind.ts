import type { MotivationSparkRecord } from '@/types/motivation-spark'

export const motivationContentKindEmoji = (
  kind: MotivationSparkRecord['contentKind'],
): string => {
  switch (kind) {
    case 'image':
      return '🖼️'
    case 'audio':
      return '🎙️'
    case 'link':
      return '🔗'
    case 'mixed':
      return '✨'
    default:
      return '📝'
  }
}

export const motivationMediaBadges = (spark: MotivationSparkRecord): string[] => {
  const badges: string[] = []

  if (spark.images.length > 0) {
    badges.push(spark.images.length > 1 ? `📷 ${spark.images.length}` : '📷')
  }
  if (spark.audioUri) badges.push('🎙️')
  if (spark.links.length > 0) {
    badges.push(spark.links.length > 1 ? `🔗 ${spark.links.length}` : '🔗')
  }
  if (spark.body) badges.push('📝')

  return badges
}
