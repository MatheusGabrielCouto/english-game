import { buildCityProgress } from '@/features/city/utils/progress'
import { getNextPrestigeTier, getPrestigeTier } from '@/features/prestige/constants/prestige-catalog'
import { getXPProgress } from '@/features/player/utils/xp'
import type { Mission } from '@/types/mission'
import type { RoutineTodayItem } from '@/types/routine'

export type HomeDailyProgress = {
  missionsCompleted: number
  missionsTotal: number
  routinesCompleted: number
  routinesTotal: number
  studySessions: number
  xpToday: number
  overallPercent: number
}

export type HomeNextReward = {
  key: string
  emoji: string
  title: string
  subtitle: string
  percent: number
  route?: string
}

export const computeHomeDailyProgress = (params: {
  missions: Mission[]
  dueToday: RoutineTodayItem[]
  studySessions: number
}): HomeDailyProgress => {
  const { missions, dueToday, studySessions } = params
  const missionsCompleted = missions.filter((m) => m.completed).length
  const missionsTotal = missions.length
  const routinesCompleted = dueToday.filter((r) => r.completed).length
  const routinesTotal = dueToday.length
  const xpToday = missions.filter((m) => m.completed).reduce((sum, m) => sum + m.xpReward, 0)

  const missionPct = missionsTotal > 0 ? (missionsCompleted / missionsTotal) * 100 : 0
  const routinePct = routinesTotal > 0 ? (routinesCompleted / routinesTotal) * 100 : 100
  const weights = routinesTotal > 0 ? [0.55, 0.35, 0.1] : [0.85, 0.15]
  const values = routinesTotal > 0
    ? [missionPct, routinePct, Math.min(100, studySessions * 20)]
    : [missionPct, Math.min(100, studySessions * 25)]

  const overallPercent = Math.round(
    values.reduce((sum, value, index) => sum + value * weights[index], 0),
  )

  return {
    missionsCompleted,
    missionsTotal,
    routinesCompleted,
    routinesTotal,
    studySessions,
    xpToday,
    overallPercent: Math.min(100, Math.max(0, overallPercent)),
  }
}

export const resolveHomeNextReward = (params: {
  level: number
  xp: number
  unopenedLoot: number
  petEggCount: number
  prestigeLevel: number
  canPrestige: boolean
  claimableSeasonTiers: number
  playerLevel: number
}): HomeNextReward => {
  const xpProgress = getXPProgress(params.level, params.xp)
  const xpPercent =
    xpProgress.required > 0
      ? Math.round((xpProgress.current / xpProgress.required) * 100)
      : 0

  if (xpPercent >= 60) {
    return {
      key: 'level-up',
      emoji: '⭐',
      title: `Nível ${params.level + 1}`,
      subtitle: `${xpProgress.current}/${xpProgress.required} XP`,
      percent: xpPercent,
      route: '/profile',
    }
  }

  if (params.unopenedLoot > 0) {
    return {
      key: 'loot',
      emoji: '📦',
      title: 'Loot Box no inventário',
      subtitle: `${params.unopenedLoot} caixa${params.unopenedLoot > 1 ? 's' : ''} para abrir`,
      percent: Math.min(100, params.unopenedLoot * 25),
      route: '/loot-boxes',
    }
  }

  if (params.petEggCount > 0) {
    return {
      key: 'pet-egg',
      emoji: '🥚',
      title: 'Ovo de pet',
      subtitle: `${params.petEggCount} no inventário`,
      percent: Math.min(100, params.petEggCount * 40),
      route: '/(tabs)/inventory',
    }
  }

  const cityProgress = buildCityProgress(params.playerLevel)
  if (cityProgress.nextBuilding && cityProgress.levelsUntilNext != null) {
    const span =
      cityProgress.nextBuilding.requiredLevel - cityProgress.currentBuilding.requiredLevel
    const done = params.playerLevel - cityProgress.currentBuilding.requiredLevel
    const percent = span > 0 ? Math.min(100, Math.round((done / span) * 100)) : 100

    return {
      key: 'city',
      emoji: cityProgress.nextBuilding.icon,
      title: cityProgress.nextBuilding.name,
      subtitle: cityProgress.progressLabel,
      percent,
      route: '/city',
    }
  }

  if (params.canPrestige) {
    const next = getNextPrestigeTier(params.prestigeLevel)
    return {
      key: 'prestige',
      emoji: '🌟',
      title: next?.name ?? 'Ascensão',
      subtitle: 'Prestígio disponível',
      percent: 100,
      route: '/prestige',
    }
  }

  if (params.claimableSeasonTiers > 0) {
    return {
      key: 'season',
      emoji: '🎫',
      title: 'Passe de temporada',
      subtitle: `${params.claimableSeasonTiers} recompensa${params.claimableSeasonTiers > 1 ? 's' : ''} pronta${params.claimableSeasonTiers > 1 ? 's' : ''}`,
      percent: 100,
      route: '/metagame',
    }
  }

  const currentPrestige = getPrestigeTier(params.prestigeLevel)
  return {
    key: 'fallback',
    emoji: '🎯',
    title: 'Continue evoluindo',
    subtitle: currentPrestige?.name ?? 'Complete missões hoje',
    percent: Math.max(xpPercent, 12),
    route: '/(tabs)/play',
  }
}

export const getCityTierPercent = (level: number): number => {
  const progress = buildCityProgress(level)
  if (!progress.nextBuilding) return 100
  const span = progress.nextBuilding.requiredLevel - progress.currentBuilding.requiredLevel
  const done = level - progress.currentBuilding.requiredLevel
  return span > 0 ? Math.min(100, Math.round((done / span) * 100)) : 100
}

export const getStreakGlowIntensity = (streak: number): 'off' | 'low' | 'mid' | 'high' => {
  if (streak <= 0) return 'off'
  if (streak < 7) return 'low'
  if (streak < 30) return 'mid'
  return 'high'
}
