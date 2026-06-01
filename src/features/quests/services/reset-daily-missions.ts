import { replaceMissionsForDate } from '@/storage/repositories/missions-repository';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import { selectDailyMissions } from '@/features/game-design/utils/mission-selector';

import { getTodayKey } from '../utils/date';

export const resetDailyMissionsInDatabase = async () => {
  const today = getTodayKey();
  const difficulty = await getLearningDifficulty();
  const missions = selectDailyMissions(today, difficulty);
  await replaceMissionsForDate(today, missions);

  return { missions, missionsDate: today };
};
