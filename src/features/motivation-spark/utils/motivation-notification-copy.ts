import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { buildMotivationNotificationSnippet, truncateSnippet } from './motivation-snippet'

export type MotivationNotificationVariant = 'morning' | 'evening'

export type MotivationNotificationContent = {
  title: string
  tagline: string
  body: string
}

const TITLE_MAX_LENGTH = 56
const BODY_MAX_LENGTH = 140

const MORNING_TAGLINES = [
  'Sua chama de hoje',
  'Um lembrete só seu',
  'O porquê que você guardou',
  'Acenda antes do dia começar',
] as const

const EVENING_TAGLINES = [
  'Última chama do dia',
  'Antes de encerrar o dia',
  'Reacenda por um instante',
  'Uma pausa com você mesmo',
] as const

const hashSeed = (sparkId: string, dateKey: string): number => {
  const raw = `${sparkId}:${dateKey}`
  let hash = 0
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash + raw.charCodeAt(index) * (index + 1)) % 997
  }
  return hash
}

const pickTagline = (
  variant: MotivationNotificationVariant,
  spark: MotivationSparkRecord,
  dateKey: string,
): string => {
  const pool = variant === 'evening' ? EVENING_TAGLINES : MORNING_TAGLINES
  const base = pool[hashSeed(spark.id, dateKey) % pool.length]
  const emoji = variant === 'evening' ? '🕯️' : MOTIVATION_UI.hub.emoji
  const prefix = spark.isPinned ? '⭐ ' : `${emoji} `
  return `${prefix}${base}`
}

const truncateTitle = (title: string): string => truncateSnippet(title.trim(), TITLE_MAX_LENGTH)

const quoteBody = (text: string): string => {
  const snippet = truncateSnippet(text, BODY_MAX_LENGTH - 2)
  if (!snippet) return ''
  if (snippet.startsWith('“') || snippet.startsWith('"')) return snippet
  return `“${snippet}”`
}

const buildBodyForSpark = (
  spark: MotivationSparkRecord,
  variant: MotivationNotificationVariant,
): string => {
  const snippet = buildMotivationNotificationSnippet(spark)

  if (spark.body?.trim()) {
    return quoteBody(snippet)
  }

  if (spark.audioUri) {
    return variant === 'evening'
      ? MOTIVATION_UI.notifications.eveningAudioBody
      : MOTIVATION_UI.notifications.morningAudioBody
  }

  if (spark.images.length > 0 && snippet === spark.title) {
    return variant === 'evening'
      ? MOTIVATION_UI.notifications.eveningImageBody
      : MOTIVATION_UI.notifications.morningImageBody
  }

  if (spark.links[0] && snippet !== spark.title) {
    return quoteBody(snippet)
  }

  if (snippet && snippet !== spark.title) {
    return quoteBody(snippet)
  }

  return variant === 'evening'
    ? MOTIVATION_UI.notifications.eveningFallbackBody(spark.title)
    : MOTIVATION_UI.notifications.morningFallbackBody(spark.title)
}

export const buildMotivationNotificationContent = (
  spark: MotivationSparkRecord,
  variant: MotivationNotificationVariant,
  dateKey: string,
): MotivationNotificationContent => {
  const title = truncateTitle(spark.title)
  const tagline = pickTagline(variant, spark, dateKey)
  const body = buildBodyForSpark(spark, variant)

  return { title, tagline, body }
}
