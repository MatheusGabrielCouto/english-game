export const QUEST_PROGRESS_WIDGET_NAME = 'QuestProgressWidget'

export const WIDGET_SNAPSHOT_STORAGE_KEY = 'eq:android-widget-snapshot'

import { buildAppDeepLink } from '@/constants/deep-link-paths'

export const WIDGET_DEEP_LINK = buildAppDeepLink('/play')

export const WIDGET_COLORS = {
  background: '#06060b',
  surface: '#0f0f18',
  border: '#2a2a3d',
  foreground: '#fafafa',
  muted: '#a1a1aa',
  primary: '#8b5cf6',
  gold: '#fbbf24',
  streak: '#fb923c',
  success: '#22c55e',
  accent: '#38bdf8',
} as const

export const WIDGET_UI = {
  brand: 'English Quest',
  streakLabel: 'streak',
  streakDays: (days: number) => (days === 1 ? '1 dia' : `${days} dias`),
  studiedToday: 'Estudou hoje',
  studyPending: 'Estude hoje para manter',
  missionSection: 'Missão de hoje',
  doNow: 'Faça agora',
  allDoneTitle: 'Tudo feito hoje!',
  allDoneBody: 'Volte amanhã para novas missões',
  noMissions: 'Carregando missões…',
  pending: (done: number, total: number) => `${done}/${total} concluídas`,
  xpReward: (xp: number) => `+${xp} XP`,
  openApp: 'Abrir English Quest',
} as const
