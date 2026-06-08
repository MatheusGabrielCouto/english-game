import type { MotivationDailyPickRecord, MotivationSparkRecord } from '@/types/motivation-spark'

import { resolveRotationWeight } from './motivation-mappers'

const hashString = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

const daysSinceIso = (iso: string | null, referenceMs: number): number | null => {
  if (!iso) return null
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return null
  return Math.floor((referenceMs - parsed) / (24 * 60 * 60 * 1000))
}

export const computeSparkWeight = (
  spark: MotivationSparkRecord,
  referenceMs = Date.now(),
): number => {
  let weight = resolveRotationWeight(spark)

  if (spark.lastShownAt == null) {
    weight += 2
  }

  const daysSinceShown = daysSinceIso(spark.lastShownAt, referenceMs)
  if (daysSinceShown != null && daysSinceShown > 30) {
    weight += 1
  }

  return weight
}

export const getRecentSparkIds = (
  picks: MotivationDailyPickRecord[],
  avoidRepeatDays: number,
  referenceDateKey: string,
): Set<string> => {
  const referenceMs = Date.parse(`${referenceDateKey}T12:00:00`)
  const cutoffMs = referenceMs - avoidRepeatDays * 24 * 60 * 60 * 1000

  const ids = new Set<string>()
  for (const pick of picks) {
    const pickMs = Date.parse(`${pick.dateKey}T12:00:00`)
    if (!Number.isNaN(pickMs) && pickMs >= cutoffMs && pick.dateKey !== referenceDateKey) {
      ids.add(pick.sparkId)
    }
  }
  return ids
}

export const pickWeightedSpark = (
  sparks: MotivationSparkRecord[],
  seed: string,
): MotivationSparkRecord | null => {
  if (sparks.length === 0) return null

  const weights = sparks.map((spark) => computeSparkWeight(spark))
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  if (totalWeight <= 0) return sparks[0]

  let cursor = hashString(seed) % totalWeight
  for (let index = 0; index < sparks.length; index++) {
    cursor -= weights[index]
    if (cursor < 0) return sparks[index]
  }

  return sparks[sparks.length - 1]
}

export const pickDailyMotivationSpark = (input: {
  dateKey: string
  sparks: MotivationSparkRecord[]
  recentPicks: MotivationDailyPickRecord[]
  avoidRepeatDays: number
}): MotivationSparkRecord | null => {
  const active = input.sparks.filter((spark) => !spark.isArchived)
  if (active.length === 0) return null

  const recentIds = getRecentSparkIds(input.recentPicks, input.avoidRepeatDays, input.dateKey)
  let pool = active.filter((spark) => !recentIds.has(spark.id))
  if (pool.length === 0) {
    pool = active
  }

  return pickWeightedSpark(pool, input.dateKey)
}
