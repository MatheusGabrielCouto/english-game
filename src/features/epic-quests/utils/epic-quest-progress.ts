export const computeEpicMissionPercentage = (currentValue: number, targetValue: number): number => {
  if (targetValue <= 0) return 0
  return Math.min(100, Math.round((currentValue / targetValue) * 100))
}

export const resolvePlayerLevelMissionProgress = (
  playerLevel: number,
  targetLevel: number,
): number => Math.min(targetLevel, Math.max(0, playerLevel))

export const formatEpicMissionProgress = (mission: {
  missionType: string
  currentValue: number
  targetValue: number
}): string => {
  if (mission.missionType === 'PLAYER_LEVEL') {
    return `Nível ${mission.currentValue} / ${mission.targetValue}`
  }

  if (mission.missionType === 'XP_GAINED') {
    return `${mission.currentValue.toLocaleString('pt-BR')} / ${mission.targetValue.toLocaleString('pt-BR')} XP`
  }

  return `${mission.currentValue} / ${mission.targetValue}`
}
