import { REWARD_BURST_COPY } from '../constants/reward-burst-ui'
import type { MissionRewardBurst } from '../store/feedback-store'

export const createRewardBurst = (
  burst: Omit<MissionRewardBurst, 'id' | 'batchCount'>,
): MissionRewardBurst => ({
  ...burst,
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  batchCount: 1,
})

export const mergeRewardBursts = (
  base: MissionRewardBurst,
  incoming: Omit<MissionRewardBurst, 'id' | 'batchCount'>,
): MissionRewardBurst => {
  const batchCount = (base.batchCount ?? 1) + 1
  const studyPoints = (base.studyPoints ?? 0) + (incoming.studyPoints ?? 0)

  return {
    ...base,
    xp: base.xp + incoming.xp,
    coins: base.coins + incoming.coins,
    studyPoints: studyPoints > 0 ? studyPoints : undefined,
    batchCount,
    title: batchCount > 1 ? REWARD_BURST_COPY.multiple : base.title,
  }
}
