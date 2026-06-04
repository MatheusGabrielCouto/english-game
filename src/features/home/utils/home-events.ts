const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const

export const formatSeasonKeyLabel = (seasonKey: string): string => {
  const [year, month] = seasonKey.split('-')
  const monthIndex = Number(month)
  if (!year || monthIndex < 1 || monthIndex > 12) return seasonKey
  return `${MONTH_NAMES_PT[monthIndex - 1]} ${year}`
}

export const formatDaysRemainingLabel = (days: number): string =>
  days === 1 ? '1 dia restante' : `${days} dias restantes`

export const computeSeasonTierProgress = (
  seasonPoints: number,
  nextTierPointsRequired: number | undefined,
): number => {
  if (!nextTierPointsRequired || nextTierPointsRequired <= 0) return 100
  return Math.min(100, Math.round((seasonPoints / nextTierPointsRequired) * 100))
}
