import { STAGE_CONFIG } from '@/features/pet/constants'
import type { GameEvent } from '@/services/game-events'
import { GameEvents } from '@/services/game-events'
import type { PetStageValue } from '@/types/pet'
import { haptics } from '@/utils/haptics'

import { useFeedbackStore } from '../store/feedback-store'

let initialized = false

const handleGameEvent = (event: GameEvent) => {
  const store = useFeedbackStore.getState()

  switch (event.type) {
    case 'PLAYER_LEVEL_UP':
      haptics.success()
      store.enqueueLevelUp({
        level: event.level,
        previousLevel: event.previousLevel,
        levelsGained: event.levelsGained,
      })
      break

    case 'DAILY_MISSION_COMPLETED':
      haptics.medium()
      if (event.xpReward !== undefined && event.coinReward !== undefined) {
        store.addRewardBurst({
          title: event.missionTitle ?? 'Missão concluída!',
          xp: event.xpReward,
          coins: event.coinReward,
        })
      }
      break

    case 'XP_GAINED':
      if (event.amount >= 15) {
        haptics.light()
      }
      break

    case 'STUDY_DAY_RECORDED':
      haptics.success()
      store.showToast('Dia de estudo registrado!', 'success')
      break

    case 'PET_STAGE_EVOLVED': {
      const stageConfig = STAGE_CONFIG[event.stage as PetStageValue]
      haptics.heavy()
      store.setPetEvolution({
        stage: event.stage,
        emoji: stageConfig?.emoji ?? '✨',
        label: stageConfig?.label ?? event.stage,
      })
      break
    }

    case 'ACHIEVEMENT_UNLOCKED':
    case 'TITLE_UNLOCKED':
    case 'CITY_BUILDING_UNLOCKED':
    case 'CONTRACT_COMPLETED':
    case 'LOOT_BOX_OPENED':
      haptics.success()
      store.triggerConfetti()
      break

    case 'SHOP_PURCHASE_COMPLETED':
      haptics.medium()
      store.showToast(`${event.productName} adicionado!`, 'success')
      break

    case 'FOCUS_SESSION_COMPLETED':
      haptics.success()
      store.addRewardBurst({
        title: 'Sessão de foco concluída!',
        xp: event.rewards.xp,
        coins: event.rewards.coins,
      })
      if (event.rewards.lootBoxRarity) {
        store.triggerConfetti()
      }
      break

    case 'CONTRACT_FAILED':
      haptics.warning()
      store.showToast('Contrato falhou. Stake perdido.', 'warning')
      break

    case 'WEEKLY_MISSION_CLAIMED':
      haptics.success()
      store.showToast('Missão semanal resgatada!', 'success')
      break

    case 'PRESTIGE_ASCENDED':
      haptics.heavy()
      break

    case 'SHIELD_EARNED':
      haptics.light()
      store.showToast(
        event.amount === 1 ? 'Escudo conquistado!' : `${event.amount} escudos conquistados!`,
        'info',
      )
      break

    default:
      break
  }
}

export const FeedbackService = {
  initListeners: () => {
    if (initialized) return
    initialized = true
    GameEvents.subscribe(handleGameEvent)
  },
}

export const showGameToast = (
  message: string,
  variant: 'success' | 'info' | 'warning' | 'error' = 'info',
) => {
  useFeedbackStore.getState().showToast(message, variant)
}
