import type { Mission } from '@/types/mission';

import { selectDailyMissions } from '@/features/game-design/utils/mission-selector';
import { LearningDifficulty } from '@/features/game-design/constants/difficulty';

/** @deprecated Use selectDailyMissions via resetDailyMissionsInDatabase */
export const createDefaultMissions = (): Mission[] =>
  selectDailyMissions(new Date().toISOString().slice(0, 10), LearningDifficulty.BALANCED);
