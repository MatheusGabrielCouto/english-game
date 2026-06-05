import {
  HOME_FOCUS_REFRESH_DOMAINS,
  HOME_FOCUS_REFRESH_TTL_MS,
  type HomeFocusRefreshDomain,
} from '../constants/home-focus-refresh-ui'

export type HomeFocusRefreshStamps = Partial<Record<HomeFocusRefreshDomain, number>>

export const shouldRefreshHomeFocusDomain = (
  lastRefreshedAt: number | undefined,
  now: number,
  ttlMs: number = HOME_FOCUS_REFRESH_TTL_MS,
): boolean => {
  if (lastRefreshedAt === undefined) return true
  return now - lastRefreshedAt >= ttlMs
}

export const getStaleHomeFocusDomains = (
  stamps: HomeFocusRefreshStamps,
  now: number,
  ttlMs: number = HOME_FOCUS_REFRESH_TTL_MS,
): HomeFocusRefreshDomain[] =>
  HOME_FOCUS_REFRESH_DOMAINS.filter((domain) =>
    shouldRefreshHomeFocusDomain(stamps[domain], now, ttlMs),
  )

export const markHomeFocusDomainsRefreshed = (
  stamps: HomeFocusRefreshStamps,
  domains: readonly HomeFocusRefreshDomain[],
  at: number,
): HomeFocusRefreshStamps => {
  const next = { ...stamps }
  for (const domain of domains) {
    next[domain] = at
  }
  return next
}
