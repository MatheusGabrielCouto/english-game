import { usePlayerStore } from '@/features/player/store/player-store';
import { getTodayKey } from '@/features/quests/utils/date';
import { ShieldService } from '@/features/shields/services/shield-service';
import { GameEvents } from '@/services/game-events';
import { getPlayer, savePlayer } from '@/storage/repositories/player-repository';
import { StudyDaysRepository } from '@/storage/repositories/study-days-repository';

import {
    calculateBestStreak,
    calculateStreakAfterStudy,
} from '../utils/streak';

let lastRecordedStudyDay: string | null = null;

const syncPlayerStore = (record: {
  lastStudyDate: string;
  currentStreak: number;
  bestStreak: number;
  totalStudyDays: number;
  shields?: number;
}) => {
  usePlayerStore.setState({
    lastStudyDate: record.lastStudyDate,
    currentStreak: record.currentStreak,
    bestStreak: record.bestStreak,
    totalStudyDays: record.totalStudyDays,
    ...(record.shields !== undefined ? { shields: record.shields } : {}),
  });
};

export const StreakService = {
  async reconcileOnStartup(): Promise<void> {
    let player = await getPlayer();
    if (!player) return;

    const today = getTodayKey();

    if (player.lastStudyDate && !(await StudyDaysRepository.findByDate(player.lastStudyDate))) {
      await StudyDaysRepository.create(player.lastStudyDate);
    }

    const totalStudyDays = await StudyDaysRepository.countAll();
    if (totalStudyDays !== player.totalStudyDays) {
      player = { ...player, totalStudyDays };
      await savePlayer(player);
      usePlayerStore.setState({ totalStudyDays });
    }

    await ShieldService.processStreakProtection(player, today);
  },

  async recordStudyDay(): Promise<boolean> {
    const today = getTodayKey();

    if (lastRecordedStudyDay === today) {
      return false;
    }

    let player = await getPlayer();
    if (!player) return false;

    player = await ShieldService.processStreakProtection(player, today);

    if (player.lastStudyDate === today || (await StudyDaysRepository.findByDate(today))) {
      lastRecordedStudyDay = today;
      syncPlayerStore({
        lastStudyDate: today,
        currentStreak: player.currentStreak,
        bestStreak: player.bestStreak,
        totalStudyDays: player.totalStudyDays,
        shields: player.shields,
      });
      return false;
    }

    const currentStreak = calculateStreakAfterStudy(
      player.lastStudyDate,
      player.currentStreak,
      today,
    );
    const bestStreak = calculateBestStreak(player.bestStreak, currentStreak);

    await StudyDaysRepository.create(today);
    const totalStudyDays = await StudyDaysRepository.countAll();

    const updatedPlayer = {
      ...player,
      lastStudyDate: today,
      currentStreak,
      bestStreak,
      totalStudyDays,
    };

    await savePlayer(updatedPlayer);
    syncPlayerStore({
      lastStudyDate: today,
      currentStreak,
      bestStreak,
      totalStudyDays,
      shields: updatedPlayer.shields,
    });

    await ShieldService.checkMilestoneRewards(currentStreak);

    lastRecordedStudyDay = today;
    GameEvents.emit({ type: 'STUDY_DAY_RECORDED' });
    return true;
  },

  resetSessionCache(): void {
    lastRecordedStudyDay = null;
  },

  async getRecentStudyDays(limit = 14): Promise<string[]> {
    const records = await StudyDaysRepository.findRecent(limit);
    return records.map((record) => record.studyDate);
  },

  async getStudyDaysInMonth(year: number, month: number): Promise<Set<string>> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const records = await StudyDaysRepository.findBetween(startDate, endDate);
    return new Set(records.map((record) => record.studyDate));
  },
};
