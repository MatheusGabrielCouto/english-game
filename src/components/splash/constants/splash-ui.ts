import { SPLASH_PERF_BUDGET } from '@/constants/performance-budget'

export const SPLASH_UI = {
  title: 'English Quest',
  tagline: 'Seu mundo de evolução',
  loading: 'Carregando',
} as const

/** Timings alinhados ao budget TTI Home (P-34). */
export const SPLASH_TIMING = {
  ...SPLASH_PERF_BUDGET,
} as const

/** Logo handoff toward Home hero header (fraction of screen height). */
export const SPLASH_TRANSITION = {
  logoExitScale: 0.34,
  logoExitTranslateYRatio: -0.3,
  logoExitTranslateX: -12,
  ringBurstScale: 2.4,
} as const

export const SPLASH_COLORS = {
  background: '#000000',
  glowPrimary: '#6d28d9',
  glowAccent: '#1e3a5f',
  track: '#0c0c10',
} as const
