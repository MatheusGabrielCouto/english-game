import type { MotivationLink } from '@/types/motivation-spark'

import {
  MOTIVATION_MAX_BODY_LENGTH,
  MOTIVATION_MAX_LINKS_PER_SPARK,
  MOTIVATION_MAX_TITLE_LENGTH,
} from '../constants/motivation-limits'

export const validateMotivationTitle = (title: string): string | null => {
  const trimmed = title.trim()
  if (!trimmed) return 'Informe um título.'
  if (trimmed.length > MOTIVATION_MAX_TITLE_LENGTH) {
    return `O título pode ter no máximo ${MOTIVATION_MAX_TITLE_LENGTH} caracteres.`
  }
  return null
}

export const validateMotivationBody = (body: string): string | null => {
  if (body.length > MOTIVATION_MAX_BODY_LENGTH) {
    return `O texto pode ter no máximo ${MOTIVATION_MAX_BODY_LENGTH} caracteres.`
  }
  return null
}

export const normalizeMotivationTagsInput = (raw: string): string[] => {
  return raw
    .split(/[,#]+/)
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter((tag) => tag.length > 0)
}

export const normalizeMotivationUrl = (raw: string): string | null => {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export const validateMotivationLink = (url: string): string | null => {
  if (!url.trim()) return 'Informe um link.'
  if (!normalizeMotivationUrl(url)) return 'Link inválido. Use http:// ou https://'
  return null
}

export const validateMotivationLinks = (links: MotivationLink[]): string | null => {
  if (links.length > MOTIVATION_MAX_LINKS_PER_SPARK) {
    return `Máximo de ${MOTIVATION_MAX_LINKS_PER_SPARK} links por faísca.`
  }
  for (const link of links) {
    const error = validateMotivationLink(link.url)
    if (error) return error
  }
  return null
}

export const hasMotivationSparkContent = (input: {
  body?: string | null
  images?: string[]
  audioUri?: string | null
  links?: MotivationLink[]
}): boolean => {
  const hasBody = Boolean(input.body?.trim())
  const hasImages = (input.images?.length ?? 0) > 0
  const hasAudio = Boolean(input.audioUri)
  const hasLinks = (input.links?.length ?? 0) > 0
  return hasBody || hasImages || hasAudio || hasLinks
}

export const validateMotivationSparkContent = (input: {
  body?: string | null
  images?: string[]
  audioUri?: string | null
  links?: MotivationLink[]
}): string | null => {
  if (!hasMotivationSparkContent(input)) {
    return 'Adicione texto, imagem, áudio ou link para sua faísca.'
  }
  return validateMotivationLinks(input.links ?? [])
}
