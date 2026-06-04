import { LootBoxService } from '@/features/loot-boxes/services/loot-box-service';
import { PlayerService } from '@/features/player/services/player-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { GameEvents, type GameEvent } from '@/services/game-events';
import {
    getAppSettings,
    saveAppSettings,
    setCurrentWeekStart,
} from '@/storage/repositories/app-settings-repository';
import { WeeklyMissionRepository } from '@/storage/repositories/weekly-mission-repository';
import { LootBoxRarity } from '@/types/inventory';
import type { WeeklyMission } from '@/types/weekly-mission';
import type { WeeklyMissionType } from '@/types/weekly-mission-type';

import {
    buildWeeklyMissionFromTemplate,
    WEEKLY_MISSION_CATALOG,
    type WeeklyMissionTemplate,
} from '@/features/game-design/catalogs/weekly-mission-catalog';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { pickDeterministicSubset, scaleCoins, scaleReward } from '@/features/game-design/utils/reward-scaling';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import { applyProgressDelta, isMissionComplete } from '../utils/progress';
import { getWeekBounds } from '../utils/week';

type WeeklyMissionsListener = (missions: WeeklyMission[], weekStartDate: string) => void;

let listenersInitialized = false;
const missionListeners = new Set<WeeklyMissionsListener>();

let cachedMissions: WeeklyMission[] = [];
let cachedWeekStart = '';

const notifyListeners = () => {
  missionListeners.forEach((listener) => listener(cachedMissions, cachedWeekStart));
};

export const WeeklyMissionService = {
  subscribe(listener: WeeklyMissionsListener): () => void {
    missionListeners.add(listener);
    listener(cachedMissions, cachedWeekStart);
    return () => missionListeners.delete(listener);
  },

  getCachedMissions: (): WeeklyMission[] => cachedMissions,

  getCachedWeekStart: (): string => cachedWeekStart,

  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void WeeklyMissionService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    await WeeklyMissionService.ensureCurrentWeek();

    switch (event.type) {
      case 'DAILY_MISSION_COMPLETED':
        await WeeklyMissionService.updateProgress(
          'DAILY_MISSIONS_COMPLETED',
          1,
        );
        break;
      case 'XP_GAINED':
        await WeeklyMissionService.updateProgress('XP_GAINED', event.amount);
        break;
      case 'STUDY_DAY_RECORDED':
        await WeeklyMissionService.updateProgress('STUDY_DAYS', 1);
        break;
      case 'WORDS_LEARNED':
        await WeeklyMissionService.updateProgress('WORDS_LEARNED', event.amount);
        break;
      case 'SPEAKING_SESSION_COMPLETED':
        await WeeklyMissionService.updateProgress(
          'SPEAKING_SESSIONS',
          event.amount,
        );
        break;
      case 'DUEL_WON':
        await WeeklyMissionService.updateProgress('DUEL_WINS', 1);
        break;
      case 'FLASH_SESSION_DONE':
        if (event.cardsReviewed > 0) {
          await WeeklyMissionService.updateProgress('FLASH_REVIEWS', event.cardsReviewed);
        }
        break;
      case 'JOURNAL_ENTRY_CREATED':
        await WeeklyMissionService.updateProgress('JOURNAL_ENTRIES', 1);
        break;
      case 'JOURNAL_ENTRY_REVIEWED':
        await WeeklyMissionService.updateProgress('JOURNAL_REVIEWS', 1);
        break;
      default:
        break;
    }
  },

  async ensureCurrentWeek(): Promise<void> {
    const { weekStartDate } = getWeekBounds();
    const settings = await getAppSettings();

    if (!settings.currentWeekStart) {
      await WeeklyMissionService.getCurrentWeekMissions();
      if (cachedMissions.length === 0) {
        await WeeklyMissionService.generateWeeklyMissions();
      }
      await setCurrentWeekStart(weekStartDate);
      return;
    }

    if (settings.currentWeekStart !== weekStartDate) {
      await WeeklyMissionService.resetWeek();
      await setCurrentWeekStart(weekStartDate);
      return;
    }

    await WeeklyMissionService.getCurrentWeekMissions();
  },

  async generateWeeklyMissions(): Promise<WeeklyMission[]> {
    const bounds = getWeekBounds();
    const existing = await WeeklyMissionRepository.findAllByWeek(bounds.weekStartDate);

    if (existing.length > 0) {
      cachedMissions = existing;
      cachedWeekStart = bounds.weekStartDate;
      notifyListeners();
      return existing;
    }

    const difficulty = await getLearningDifficulty();
    const config = getDifficultyConfig(difficulty);
    const templates = pickDeterministicSubset(
      WEEKLY_MISSION_CATALOG,
      config.weeklyMissionCount,
      `weekly-${bounds.weekStartDate}-${difficulty}`,
    );

    const missions = templates.map((template: WeeklyMissionTemplate) => {
      const mission = buildWeeklyMissionFromTemplate(
        {
          id: template.id,
          title: template.title,
          description: template.description,
          missionType: template.missionType,
          targetValue: template.targetValue,
          xpReward: scaleReward(template.baseXp, template.difficulty, difficulty),
          coinReward: scaleCoins(template.baseCoins, template.difficulty, difficulty),
        },
        bounds,
      );
      return mission;
    });

    for (const mission of missions) {
      await WeeklyMissionRepository.create(mission);
    }

    cachedMissions = missions;
    cachedWeekStart = bounds.weekStartDate;
    notifyListeners();
    return missions;
  },

  async getCurrentWeekMissions(): Promise<WeeklyMission[]> {
    const bounds = getWeekBounds();
    let missions = await WeeklyMissionRepository.findAllByWeek(bounds.weekStartDate);

    if (missions.length === 0) {
      missions = await WeeklyMissionService.generateWeeklyMissions();
    }

    cachedMissions = missions;
    cachedWeekStart = bounds.weekStartDate;
    notifyListeners();
    return missions;
  },

  async updateProgress(type: WeeklyMissionType, delta: number): Promise<void> {
    if (delta <= 0) return;

    await WeeklyMissionService.ensureCurrentWeek();
    const weekStartDate = cachedWeekStart || getWeekBounds().weekStartDate;

    const updatedMissions: WeeklyMission[] = [];

    for (const mission of cachedMissions) {
      if (mission.missionType !== type || mission.claimed) {
        updatedMissions.push(mission);
        continue;
      }

      const updated = applyProgressDelta(mission, delta);
      if (
        updated.currentValue !== mission.currentValue ||
        updated.completed !== mission.completed
      ) {
        await WeeklyMissionRepository.update(updated);
      }
      updatedMissions.push(updated);
    }

    cachedMissions = updatedMissions;
    notifyListeners();
  },

  checkCompletion(mission: WeeklyMission): WeeklyMission {
    if (mission.completed) return mission;
    if (!isMissionComplete(mission)) return mission;
    return { ...mission, completed: true };
  },

  async claimReward(id: string): Promise<boolean> {
    await WeeklyMissionService.ensureCurrentWeek();
    const weekStartDate = cachedWeekStart;
    const mission = await WeeklyMissionRepository.findById(id, weekStartDate);

    if (!mission || !mission.completed || mission.claimed) {
      return false;
    }

    PlayerService.addXP(mission.xpReward);
    PlayerService.addCoins(mission.coinReward);
    await WeeklyMissionRepository.claim(id, weekStartDate);

    const settings = await getAppSettings();
    if (settings.weeklyLootGrantedWeek !== weekStartDate) {
      const streak = usePlayerStore.getState().currentStreak;
      const bonusRarity =
        streak >= 30
          ? LootBoxRarity.EPIC
          : streak >= 7
            ? LootBoxRarity.RARE
            : LootBoxRarity.UNCOMMON;
      await LootBoxService.grantLootBox(bonusRarity, 'weekly_bonus');
      await saveAppSettings({ ...settings, weeklyLootGrantedWeek: weekStartDate });
    }

    cachedMissions = cachedMissions.map((m) =>
      m.id === id ? { ...m, claimed: true } : m,
    );
    notifyListeners();
    GameEvents.emit({ type: 'WEEKLY_MISSION_CLAIMED' });
    return true;
  },

  async resetWeek(): Promise<void> {
    const settings = await getAppSettings();
    const previousWeek = settings.currentWeekStart;

    if (previousWeek) {
      await WeeklyMissionRepository.archiveWeek(previousWeek);
    }

    const bounds = getWeekBounds();
    await WeeklyMissionRepository.deleteByWeek(bounds.weekStartDate);

    const settingsAfterArchive = await getAppSettings();
    await saveAppSettings({
      ...settingsAfterArchive,
      currentWeekStart: bounds.weekStartDate,
    });

    cachedMissions = [];
    cachedWeekStart = bounds.weekStartDate;
    await WeeklyMissionService.generateWeeklyMissions();
  },
};
