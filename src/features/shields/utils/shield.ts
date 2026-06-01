import { addDaysToDateKey } from '@/features/streak/utils/date';

import type { PlayerRecord } from '@/storage/repositories/player-repository';
import type { ShieldProtectionResult } from '@/types/shield';

export const getMissedStudyDates = (
  lastStudyDate: string | null,
  today: string,
): string[] => {
  if (!lastStudyDate) return [];

  const yesterday = addDaysToDateKey(today, -1);
  if (lastStudyDate >= yesterday) return [];

  const missed: string[] = [];
  let cursor = addDaysToDateKey(lastStudyDate, 1);

  while (cursor <= yesterday) {
    missed.push(cursor);
    cursor = addDaysToDateKey(cursor, 1);
  }

  return missed;
};

export const applyShieldProtection = (
  player: Pick<PlayerRecord, 'currentStreak' | 'shields' | 'lastStudyDate'>,
  missedDates: string[],
): ShieldProtectionResult => {
  if (missedDates.length === 0) {
    return {
      currentStreak: player.currentStreak,
      shields: player.shields,
      lastStudyDate: player.lastStudyDate,
      shieldsConsumed: 0,
      streakBroken: false,
    };
  }

  let shields = player.shields;
  let currentStreak = player.currentStreak;
  let lastStudyDate = player.lastStudyDate;
  let shieldsConsumed = 0;
  let streakBroken = false;

  for (const missedDate of missedDates) {
    if (shields > 0) {
      shields -= 1;
      shieldsConsumed += 1;
      lastStudyDate = missedDate;
      continue;
    }

    currentStreak = 0;
    streakBroken = true;
    break;
  }

  return {
    currentStreak,
    shields,
    lastStudyDate,
    shieldsConsumed,
    streakBroken,
  };
};
