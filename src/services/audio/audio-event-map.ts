import { usePlayerStore } from '@/features/player/store/player-store'
import { useMissionsStore } from '@/features/quests/store/missions-store'
import type { GameEvent } from '@/services/game-events'

import type { AudioDirectorApi } from './audio-director'
import { resolveGameEventAudio, type AudioEventContext, type AudioPlaybackPlan } from './audio-event-resolver'

export type { AudioEventContext, AudioPlaybackPlan }
export { resolveGameEventAudio }

const buildAudioEventContext = (): AudioEventContext => {
  const missions = useMissionsStore.getState().missions
  return {
    allDailyMissionsComplete:
      missions.length > 0 && missions.every((mission) => mission.completed),
    currentStreak: usePlayerStore.getState().currentStreak,
  }
}

export const handleGameEventAudio = (director: AudioDirectorApi, event: GameEvent): void => {
  for (const plan of resolveGameEventAudio(event, buildAudioEventContext())) {
    void director.playSFX(plan.assetKey, {
      family: plan.family,
      priority: plan.priority,
      delayMs: plan.delayMs,
    })
  }
}
