/**
 * TTL de refresh ao focar a Home (P-38).
 * Código puro — sem imports nativos — para testes Node.
 */
export const HOME_FOCUS_REFRESH_TTL_MS = 30_000

export const HOME_FOCUS_REFRESH_DOMAINS = [
  'vault',
  'routines',
  'pet',
  'farm',
  'city',
  'cityEvents',
  'metagame',
  'contracts',
  'inventory',
] as const

export type HomeFocusRefreshDomain = (typeof HOME_FOCUS_REFRESH_DOMAINS)[number]
