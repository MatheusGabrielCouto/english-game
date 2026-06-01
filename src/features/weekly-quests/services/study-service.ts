import { StreakService } from '@/features/streak/services/streak-service';

export const StudyService = {
  recordStudyDay: (): Promise<boolean> => StreakService.recordStudyDay(),

  resetSessionCache: (): void => StreakService.resetSessionCache(),
};
