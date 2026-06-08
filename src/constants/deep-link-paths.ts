import type { Href } from 'expo-router'

import { NotificationCategory, type NotificationCategoryValue } from '@/types/notification'

import { motivationSparkHref, playTabHref, routes, vaultEntryHref } from './routes'

export const DEEP_LINK_SCHEME = 'englishquest'
export const DEEP_LINK_HOST = 'englishquest.app'
export const DEEP_LINK_WWW_HOST = `www.${DEEP_LINK_HOST}`

export type DeepLinkQuery = Record<string, string | undefined>

const normalizePath = (path: string): string => {
  const trimmed = path.trim()
  if (!trimmed || trimmed === '/') return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const buildQueryString = (query?: DeepLinkQuery): string => {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}

export const buildDeepLinkPath = (path: string, query?: DeepLinkQuery): string => {
  const normalized = normalizePath(path)
  return `${normalized}${buildQueryString(query)}`
}

export const buildAppDeepLink = (path: string, query?: DeepLinkQuery): string =>
  `${DEEP_LINK_SCHEME}://${buildDeepLinkPath(path, query).replace(/^\//, '')}`

export const buildUniversalLink = (path: string, query?: DeepLinkQuery): string =>
  `https://${DEEP_LINK_HOST}${buildDeepLinkPath(path, query)}`

const NOTIFICATION_CATEGORY_PATHS: Record<NotificationCategoryValue, string> = {
  [NotificationCategory.DAILY_REMINDER]: '/play',
  [NotificationCategory.STREAK_REMINDER]: '/streak',
  [NotificationCategory.STREAK_RISK]: '/streak',
  [NotificationCategory.SHIELD_WARNING]: '/',
  [NotificationCategory.PET_REMINDER]: '/pet',
  [NotificationCategory.CONTRACT_REMINDER]: '/contracts',
  [NotificationCategory.ACHIEVEMENT_PROGRESS]: '/achievements',
  [NotificationCategory.CITY_PROGRESS]: '/city',
  [NotificationCategory.FLASH_DUE]: '/flash',
  [NotificationCategory.ROUTINE_REMINDER]: '/routines',
  [NotificationCategory.JOURNAL_REVIEW]: '/vault',
  [NotificationCategory.WEEKLY_MISSION]: '/missions',
  [NotificationCategory.LOOT_REMINDER]: '/loot',
  [NotificationCategory.BREEDING_READY]: '/pet-farm/breeding',
  [NotificationCategory.DAILY_QUESTS]: '/play',
  [NotificationCategory.DUEL_BOSS]: '/duels',
  [NotificationCategory.LEXICON_REMINDER]: '/city',
  [NotificationCategory.SEASON_REMINDER]: '/metagame',
  [NotificationCategory.PRESTIGE_REMINDER]: '/prestige',
  [NotificationCategory.SHOP_OFFER]: '/shop',
  [NotificationCategory.MOTIVATION_SPARK]: '/motivation',
}

export const buildNotificationDeepLink = (
  category: NotificationCategoryValue | string,
  options?: { path?: string; query?: DeepLinkQuery },
): string => {
  const path =
    options?.path ??
    NOTIFICATION_CATEGORY_PATHS[category as NotificationCategoryValue] ??
    '/'
  return buildAppDeepLink(path, options?.query)
}

const resolveVaultEntryPath = (segments: string[]): Href | null => {
  const entryIndex = segments.findIndex((segment) => segment === 'entry')
  if (entryIndex === -1 || !segments[entryIndex + 1]) return null
  return vaultEntryHref(segments[entryIndex + 1])
}

export const resolveDeepLinkPathToHref = (path: string, query?: DeepLinkQuery): Href => {
  const normalized = normalizePath(path)
  const segments = normalized.split('/').filter(Boolean)

  if (segments[0] === 'vault' && segments[1] === 'entry' && segments[2]) {
    return vaultEntryHref(segments[2])
  }

  if (segments[0] === 'motivation') {
    if (segments[1]) return motivationSparkHref(segments[1])
    return routes.motivation.hub
  }

  switch (normalized) {
    case '/':
    case '/home':
    case '/streak':
      return routes.tabs.home
    case '/play':
    case '/missions':
      return routes.tabs.play
    case '/routines':
      return playTabHref('routines')
    case '/vault':
      return routes.vault.library
    case '/loot':
      return routes.lootBoxes
    case '/flash':
      return routes.flashDeckReview
    case '/focus':
      return routes.focusMode
    case '/city': {
      const poiKey = query?.poiKey
      const tab = query?.tab
      if (!poiKey && !tab) return routes.city
      const params = new URLSearchParams()
      if (poiKey) params.set('poiKey', poiKey)
      if (tab) params.set('tab', tab)
      return `${routes.city}?${params.toString()}` as Href
    }
    default:
      break
  }

  if (segments[0] === 'pet-farm') {
    const subpath = segments.slice(1).join('/')
    if (!subpath) return routes.petFarm
    return `/pet-farm/${subpath}` as Href
  }

  const directRoutes: Record<string, Href> = {
    '/pet': routes.pet,
    '/shop': routes.shop,
    '/contracts': routes.contracts,
    '/achievements': routes.achievements,
    '/duels': routes.duels,
    '/prestige': routes.prestige,
    '/metagame': routes.metagame,
    '/pet-farm': routes.petFarm,
    '/profile': routes.profile,
    '/inventory': routes.inventory,
    '/statistics': routes.statistics,
    '/focus-mode': routes.focusMode,
    '/loot-boxes': routes.lootBoxes,
    '/flash-deck': routes.flashDeck,
    '/flash-deck/review': routes.flashDeckReview,
  }

  if (directRoutes[normalized]) {
    return directRoutes[normalized]
  }

  const vaultEntry = resolveVaultEntryPath(segments)
  if (vaultEntry) return vaultEntry

  return routes.tabs.home
}

const resolvePathFromParsedUrl = (parsed: URL, isAppScheme: boolean): string => {
  if (!isAppScheme) {
    return normalizePath(parsed.pathname)
  }

  const hostPart = parsed.hostname ? `/${parsed.hostname}` : ''
  const pathPart = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : ''
  return normalizePath(`${hostPart}${pathPart}` || '/')
}

export const parseDeepLinkUrl = (
  rawUrl: string,
): { path: string; query: DeepLinkQuery } | null => {
  if (!rawUrl?.trim()) return null

  try {
    const normalized = rawUrl.includes('://') ? rawUrl : `${DEEP_LINK_SCHEME}://${rawUrl}`
    const parsed = new URL(normalized)
    const isAppScheme = parsed.protocol === `${DEEP_LINK_SCHEME}:`
    const isUniversalHost =
      parsed.protocol === 'https:' &&
      (parsed.hostname === DEEP_LINK_HOST || parsed.hostname === DEEP_LINK_WWW_HOST)

    if (!isAppScheme && !isUniversalHost) return null

    const path = resolvePathFromParsedUrl(parsed, isAppScheme)
    const query: DeepLinkQuery = {}
    parsed.searchParams.forEach((value, key) => {
      query[key] = value
    })

    return { path, query }
  } catch {
    return null
  }
}

export const resolveDeepLinkUrlToHref = (rawUrl: string): Href | null => {
  const parsed = parseDeepLinkUrl(rawUrl)
  if (!parsed) return null
  return resolveDeepLinkPathToHref(parsed.path, parsed.query)
}
