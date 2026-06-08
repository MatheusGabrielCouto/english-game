import { motivationSparkHref, routes } from '@/constants/routes'
import type { MotivationDailySparkSnapshot } from '@/features/motivation-spark/services/motivation-daily-pick-service'
import type { MentorMotivationBridgeSnapshot } from '@/types/mentor-ai'

const truncate = (text: string, maxLength: number): string => {
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

const buildCoachMessage = (input: {
  sparkTitle: string | null
  openedToday: boolean
  openStreak: number
  weakestSkillLabel: string
}): string => {
  if (!input.sparkTitle) {
    return `Guarde uma frase na Chama Interior — ela alimenta minha motivação e seu foco em ${input.weakestSkillLabel}.`
  }

  if (!input.openedToday) {
    return `Sua Chama de hoje é “${input.sparkTitle}”. Abra, respire fundo e depois 15 min de ${input.weakestSkillLabel} no GPS.`
  }

  if (input.openStreak >= 7) {
    return `${input.openStreak} dias abrindo a Chama — disciplina real! Canalize isso em ${input.weakestSkillLabel} agora.`
  }

  return `Você já abriu “${input.sparkTitle}” hoje. Transforme essa energia em prática de ${input.weakestSkillLabel}.`
}

export const buildMentorMotivationBridge = (input: {
  dailySpark: MotivationDailySparkSnapshot | null
  openStreak: number
  weakestSkillLabel: string
}): MentorMotivationBridgeSnapshot => {
  const spark = input.dailySpark?.spark ?? null
  const pick = input.dailySpark?.pick ?? null
  const openedToday = Boolean(pick?.openedAt)
  const excerptSource = spark?.body?.trim() || spark?.title?.trim() || null

  const coachMessage = buildCoachMessage({
    sparkTitle: spark?.title ?? null,
    openedToday,
    openStreak: input.openStreak,
    weakestSkillLabel: input.weakestSkillLabel,
  })

  return {
    dailySparkId: spark?.id ?? null,
    dailySparkTitle: spark?.title ?? null,
    dailySparkExcerpt: excerptSource ? truncate(excerptSource, 120) : null,
    openStreak: input.openStreak,
    openedToday,
    coachMessage,
  }
}

export const resolveMotivationSparkRoute = (
  snapshot: MentorMotivationBridgeSnapshot,
): string => {
  if (snapshot.dailySparkId) {
    return motivationSparkHref(snapshot.dailySparkId)
  }
  return routes.motivation.hub
}
