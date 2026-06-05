export type RewardBurstSource = 'mission' | 'routine' | 'vault' | 'focus'

export const REWARD_BURST_EMOJI: Record<RewardBurstSource, string> = {
  mission: '✅',
  routine: '📋',
  vault: '📚',
  focus: '🎯',
}

export const REWARD_BURST_BORDER: Record<RewardBurstSource, string> = {
  mission: 'border-success/40',
  routine: 'border-primary/40',
  vault: 'border-primary/35',
  focus: 'border-accent/40',
}

export const REWARD_BURST_COPY = {
  missionFallback: 'Missão concluída!',
  vault: 'Revisão do Vault concluída!',
  focus: 'Sessão de foco concluída!',
} as const

export const resolveRewardBurstEmoji = (source?: RewardBurstSource): string =>
  source ? REWARD_BURST_EMOJI[source] : REWARD_BURST_EMOJI.mission

export const resolveRewardBurstBorder = (source?: RewardBurstSource): string =>
  source ? REWARD_BURST_BORDER[source] : REWARD_BURST_BORDER.mission
