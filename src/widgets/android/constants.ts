export const QUEST_PROGRESS_WIDGET_NAME = 'QuestProgressWidget'

export const WIDGET_SNAPSHOT_STORAGE_KEY = 'eq:android-widget-snapshot'

/** Bump when widget layout/snapshot shape changes to force a fresh draw after app update. */
export const WIDGET_SNAPSHOT_VERSION = 2

import { buildAppDeepLink } from '@/constants/deep-link-paths'

export const WIDGET_DEEP_LINK = buildAppDeepLink('/play')

export const WIDGET_COLORS = {
  background: '#06060b',
  surface: '#0f0f18',
  surfaceElevated: '#161622',
  border: '#2a2a3d',
  borderSoft: '#1f1f2e',
  foreground: '#fafafa',
  muted: '#a1a1aa',
  primary: '#8b5cf6',
  primarySoft: '#6d28d9',
  gold: '#fbbf24',
  coin: '#f59e0b',
  streak: '#fb923c',
  success: '#22c55e',
  accent: '#38bdf8',
  xp: '#a78bfa',
} as const

export const WIDGET_UI = {
  brand: 'English Quest',
  greeting: (name: string) => `Olá, ${name}`,
  level: (level: number) => `Nv. ${level}`,
  streakDays: (days: number) => (days === 1 ? '1 dia' : `${days} dias`),
  studiedToday: 'Estudou hoje',
  studyPending: 'Estude hoje',
  nextMission: 'Próxima missão',
  alsoPending: 'Também na fila',
  missionSection: 'Missões de hoje',
  doNow: 'Faça agora',
  allDoneTitle: 'Tudo feito hoje!',
  allDoneBody: 'Volte amanhã para novas missões',
  noMissions: 'Abra o app para carregar',
  pending: (done: number, total: number) => `${done}/${total} feitas`,
  xpReward: (xp: number) => `+${xp} XP`,
  coinReward: (coins: number) => `+${coins} 🪙`,
  rewards: (xp: number, coins: number) =>
    coins > 0 ? `+${xp} XP · +${coins} 🪙` : `+${xp} XP`,
  remainingToday: (xp: number, coins: number) =>
    coins > 0 ? `Faltam +${xp} XP e +${coins} 🪙` : `Faltam +${xp} XP hoje`,
  xpLevel: 'XP do nível',
  statCoins: 'Moedas',
  statShields: 'Escudos',
  statMissions: 'Missões',
  openApp: 'Abrir English Quest',
} as const
