import type { Href } from 'expo-router'

import { playTabHref, routes } from '@/constants/routes'
import type { ContractRunViewModel } from '@/types/contract'
import type { EpicMissionViewModel } from '@/types/epic-mission'
import type { Mission } from '@/types/mission'
import type { RoutineTodayItem } from '@/types/routine'
import type { WeeklyMission } from '@/types/weekly-mission'

import type { HomeActiveObjective } from '../types/home-active-objective'

export const HOME_ACTIVE_OBJECTIVES_LIMIT = 4

export type HomeActiveObjectivesInput = {
  missions: Mission[]
  dueToday: RoutineTodayItem[]
  weeklyMissions: WeeklyMission[]
  activeContract: ContractRunViewModel | null
  unopenedLoot: number
  epicMissions: EpicMissionViewModel[]
  claimableSeasonTiers: number
}

const pushObjective = (
  list: HomeActiveObjective[],
  objective: HomeActiveObjective | null,
) => {
  if (objective) list.push(objective)
}

const collectHomeActiveObjectives = (
  input: HomeActiveObjectivesInput,
): HomeActiveObjective[] => {
  const candidates: HomeActiveObjective[] = []

  const dailyPending = input.missions.filter((mission) => !mission.completed).length
  const dailyCompleted = input.missions.length - dailyPending
  const dailyTotal = input.missions.length

  if (dailyPending > 0 && dailyTotal > 0) {
    pushObjective(candidates, {
      id: 'daily-missions',
      emoji: '⚔️',
      title: 'Missões diárias',
      subtitle:
        dailyPending === 1
          ? `1 pendente · ${dailyCompleted}/${dailyTotal} concluídas`
          : `${dailyPending} pendentes · ${dailyCompleted}/${dailyTotal} concluídas`,
      percent: Math.round((dailyCompleted / dailyTotal) * 100),
      route: routes.tabs.play,
      priority: 1,
      tone: 'primary',
    })
  }

  const routinePending = input.dueToday.filter((item) => !item.completed).length
  const routineCompleted = input.dueToday.length - routinePending

  if (routinePending > 0) {
    pushObjective(candidates, {
      id: 'routines-today',
      emoji: '📋',
      title: 'Rotinas de hoje',
      subtitle:
        routinePending === 1
          ? `1 pendente · ${routineCompleted}/${input.dueToday.length} feitas`
          : `${routinePending} pendentes · ${routineCompleted}/${input.dueToday.length} feitas`,
      percent: Math.round((routineCompleted / input.dueToday.length) * 100),
      route: playTabHref('routines'),
      priority: 2,
      tone: 'accent',
    })
  }

  const weeklyClaimable = input.weeklyMissions.filter(
    (mission) => mission.completed && !mission.claimed,
  ).length

  if (weeklyClaimable > 0) {
    pushObjective(candidates, {
      id: 'weekly-claimable',
      emoji: '📅',
      title: 'Missões semanais',
      subtitle:
        weeklyClaimable === 1
          ? '1 recompensa pronta para resgatar'
          : `${weeklyClaimable} recompensas prontas para resgatar`,
      percent: 100,
      route: routes.tabs.play,
      priority: 3,
      tone: 'gold',
    })
  }

  if (input.activeContract) {
    const contract = input.activeContract
    const percent =
      contract.targetDays > 0
        ? Math.round((contract.progressDays / contract.targetDays) * 100)
        : 0

    pushObjective(candidates, {
      id: 'active-contract',
      emoji: contract.icon ?? '📜',
      title: contract.name,
      subtitle: `${contract.progressDays}/${contract.targetDays} dias · ${contract.daysRemaining} restantes`,
      percent,
      route: routes.contracts as Href,
      priority: 4,
      tone: 'warning',
    })
  }

  if (input.unopenedLoot > 0) {
    pushObjective(candidates, {
      id: 'loot-unopened',
      emoji: '📦',
      title: 'Loot boxes',
      subtitle:
        input.unopenedLoot === 1
          ? '1 caixa fechada no inventário'
          : `${input.unopenedLoot} caixas fechadas no inventário`,
      percent: Math.min(100, input.unopenedLoot * 25),
      route: routes.lootBoxes as Href,
      priority: 5,
      tone: 'gold',
    })
  }

  const activeEpic = input.epicMissions.find(
    (mission) => mission.status === 'active' && !mission.isComplete,
  )

  if (activeEpic) {
    pushObjective(candidates, {
      id: `epic-${activeEpic.id}`,
      emoji: '🏔️',
      title: activeEpic.title,
      subtitle: `${activeEpic.currentValue}/${activeEpic.targetValue} · missão épica`,
      percent: activeEpic.percentage,
      route: routes.tabs.play,
      priority: 6,
      tone: 'primary',
    })
  }

  if (input.claimableSeasonTiers > 0) {
    pushObjective(candidates, {
      id: 'season-claimable',
      emoji: '🎫',
      title: 'Passe de temporada',
      subtitle:
        input.claimableSeasonTiers === 1
          ? '1 tier pronto para resgatar'
          : `${input.claimableSeasonTiers} tiers prontos para resgatar`,
      percent: 100,
      route: routes.metagame as Href,
      priority: 7,
      tone: 'gold',
    })
  }

  return candidates.sort((left, right) => left.priority - right.priority)
}

export const buildHomeActiveObjectives = (
  input: HomeActiveObjectivesInput,
): HomeActiveObjective[] =>
  collectHomeActiveObjectives(input).slice(0, HOME_ACTIVE_OBJECTIVES_LIMIT)

export const countHomeActiveObjectives = (input: HomeActiveObjectivesInput): number =>
  collectHomeActiveObjectives(input).length
