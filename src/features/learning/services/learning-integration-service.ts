import { getTodayKey } from '@/features/quests/utils/date';
import { usePetScreenStore } from '@/features/pet/store/pet-screen-store';
import { DuelProfileService } from '@/features/duels/services/duel-profile-service';
import { CityResourceService } from '@/features/city/services/city-resource-service';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityResourceType } from '@/types/city-resource';
import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository';
import { LearningAppStateRepository } from '@/storage/repositories/learning-app-state-repository';

const DUE_NUDGE_HOURS = 48;
const MS_PER_HOUR = 60 * 60 * 1000;
const STATE_ARENA_BONUS = 'duel_arena_bonus_date';
const STATE_FLASH_NUDGE = 'flash_due_nudge_date';

let listenersInitialized = false;

const handleDuelWonLexicon = async (event: Extract<GameEvent, { type: 'DUEL_WON' }>): Promise<void> => {
  if (event.newLemmaCount <= 0) return;
  await CityResourceService.grant(
    CityResourceType.LEXICON_BRICK,
    event.newLemmaCount,
    'duel_new_lemma',
  );
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  if (event.type === 'DUEL_WON') {
    await handleDuelWonLexicon(event);
  }
};

export const LearningIntegrationService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  /** +1 stamina once per day when opening arena (city coliseum / biblioteca hook). */
  async claimDailyArenaBonus(): Promise<{ granted: boolean; message: string | null }> {
    const today = getTodayKey();
    const claimedOn = await LearningAppStateRepository.get(STATE_ARENA_BONUS);

    if (claimedOn === today) {
      return { granted: false, message: null };
    }

    const profile = await DuelProfileService.reconcileProfile();
    if (profile.stamina >= profile.staminaCap) {
      await LearningAppStateRepository.set(STATE_ARENA_BONUS, today);
      return { granted: false, message: 'Stamina já está no máximo.' };
    }

    await DuelProfileService.grantBonusStamina(1);
    await LearningAppStateRepository.set(STATE_ARENA_BONUS, today);

    return {
      granted: true,
      message: 'Bônus da arena: +1 stamina hoje.',
    };
  },

  async checkFlashDuePetNudge(): Promise<void> {
    const today = getTodayKey();
    const nudgeOn = await LearningAppStateRepository.get(STATE_FLASH_NUDGE);
    if (nudgeOn === today) return;

    const dueCount = await FlashDeckRepository.countDue();
    if (dueCount === 0) return;

    const oldestDueAt = await FlashDeckRepository.getOldestDueAt();
    if (!oldestDueAt) return;

    const ageMs = Date.now() - new Date(oldestDueAt).getTime();
    if (ageMs < DUE_NUDGE_HOURS * MS_PER_HOUR) return;

    usePetScreenStore.getState().setDialogueMessage(
      `Tem ${dueCount} carta${dueCount === 1 ? '' : 's'} na mesa há mais de 2 dias. O Buddy sente sua falta no Baralho!`,
    );
    await LearningAppStateRepository.set(STATE_FLASH_NUDGE, today);
  },
};
