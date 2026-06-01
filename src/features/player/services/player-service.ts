import { PET_XP_PLAYER_SHARE } from '@/features/game-design/constants/balance';
import { RewardModifierService } from '@/features/game-design/services/reward-modifier-service';
import { GameEvents } from '@/services/game-events';

import { usePlayerStore } from '../store/player-store';

export const PlayerService = {
  addXP: (amount: number) => {
    if (amount <= 0) return;
    const modified = RewardModifierService.applyXP(amount);
    usePlayerStore.getState().addXP(modified);
    const petXp = Math.max(1, Math.round(modified * PET_XP_PLAYER_SHARE));
    GameEvents.emit({ type: 'PET_EXPERIENCE_GRANT', amount: petXp });
  },

  addCoins: (amount: number) => {
    if (amount <= 0) return;
    const modified = RewardModifierService.applyCoins(amount);
    usePlayerStore.getState().addCoins(modified);
  },

  removeCoins: (amount: number) => usePlayerStore.getState().removeCoins(amount),
};
