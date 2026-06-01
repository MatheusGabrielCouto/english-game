import { PrestigeAscensionService } from '@/features/prestige/services/prestige-ascension-service';
import type { PrestigeAscensionResult, PrestigeSacrificeValue } from '@/types/prestige';
import { usePlayerStore } from '@/features/player/store/player-store';
import { useMissionsStore } from '@/features/quests/store';
import { getTodayKey } from '@/features/quests/utils/date';
import { useWeeklyMissionsStore } from '@/features/weekly-quests/store/weekly-missions-store';
import { GameEvents, type GameEvent } from '@/services/game-events';
import {
    getLegacyMilestones,
    getMetagameState,
    recordLegacyMilestone,
    saveMetagameState,
} from '@/storage/repositories/metagame-repository';
import { LegacyCategory, type CoreLoopSnapshot, type MetagameStateRecord } from '@/types/metagame';

import {
    ANNUAL_GOALS,
    getCurrentSeasonTier,
    getDaysLeftInSeason,
    getNextSeasonTier,
    getSeasonKey,
    PRESTIGE_TIERS,
    SEASON_POINTS,
    SEASON_TIERS,
} from '../constants/metagame-catalog';
import { SeasonPassService } from './season-pass-service';
import { useMetagameStore } from '../store/metagame-store';
import { buildDetailedCollections } from '../utils/collections';
import type { SeasonTierView } from '@/types/metagame';

let listenersInitialized = false;

const defaultState = (): MetagameStateRecord => ({
  prestigeLevel: 0,
  seasonKey: getSeasonKey(),
  seasonPoints: 0,
  seasonClaimedTiers: [],
  annualProgress: {},
  updatedAt: new Date().toISOString(),
});

const buildCollections = () => buildDetailedCollections();

const buildCoreLoopSnapshot = (): CoreLoopSnapshot => {
  const player = usePlayerStore.getState();
  const missions = useMissionsStore.getState().missions;
  const weekly = useWeeklyMissionsStore.getState().missions;
  const metagame = useMetagameStore.getState().state;
  const today = getTodayKey();

  return {
    daily: {
      completed: missions.filter((mission) => mission.completed).length,
      total: missions.length,
      studiedToday: player.lastStudyDate === today,
    },
    weekly: {
      completed: weekly.filter((mission) => mission.completed).length,
      total: weekly.length,
      claimed: weekly.filter((mission) => mission.claimed).length,
    },
    monthly: {
      seasonPoints: metagame?.seasonPoints ?? 0,
      seasonTier: getCurrentSeasonTier(metagame?.seasonPoints ?? 0),
      daysLeft: getDaysLeftInSeason(),
    },
    retention: {
      currentStreak: player.currentStreak,
      bestStreak: player.bestStreak,
      d1Ready: player.lastStudyDate !== today,
    },
  };
};

const buildAnnualGoals = (player: ReturnType<typeof usePlayerStore.getState>, stats: Record<string, number>) =>
  ANNUAL_GOALS.map((goal) => {
    let current = 0;
    switch (goal.metric) {
      case 'study_days':
        current = player.totalStudyDays;
        break;
      case 'missions':
        current = stats.missions ?? 0;
        break;
      case 'xp':
        current = player.xp + (player.level - 1) * 100;
        break;
      case 'streak_best':
        current = player.bestStreak;
        break;
      default:
        current = stats[goal.key] ?? 0;
    }

    const percentage = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
    return { ...goal, current, percentage, completed: current >= goal.target };
  });

const tryRecordLegacy = async (
  key: string,
  category: typeof LegacyCategory[keyof typeof LegacyCategory],
  title: string,
  description: string,
  occurredAt: string,
): Promise<void> => {
  const created = await recordLegacyMilestone({
    milestoneKey: key,
    category,
    title,
    description,
    occurredAt,
  });

  if (created) {
    GameEvents.emit({ type: 'LEGACY_MILESTONE', milestoneKey: key, title });
  }
};

const seedLegacyFromExistingData = async (): Promise<void> => {
  const player = usePlayerStore.getState();

  await tryRecordLegacy(
    'journey_started',
    LegacyCategory.ORIGIN,
    'Início da jornada',
    `Você começou sua aventura como ${player.name}.`,
    player.createdAt,
  );

  if (player.totalStudyDays > 0 && player.lastStudyDate) {
    await tryRecordLegacy(
      'first_study_day',
      LegacyCategory.STREAK,
      'Primeiro dia de estudo',
      'Você registrou seu primeiro dia de consistência.',
      player.lastStudyDate,
    );
  }

  if (player.bestStreak >= 7) {
    await tryRecordLegacy(
      'first_streak_7',
      LegacyCategory.STREAK,
      'Streak de 7 dias',
      'Uma semana inteira de dedicação.',
      new Date().toISOString(),
    );
  }
};

const refreshStore = async (): Promise<void> => {
  const state = (await getMetagameState()) ?? defaultState();
  const legacy = await getLegacyMilestones();
  const player = usePlayerStore.getState();
  const annualGoals = buildAnnualGoals(player, state.annualProgress);
  const collections = await buildCollections();
  const coreLoop = buildCoreLoopSnapshot();
  const nextSeasonTier = getNextSeasonTier(state.seasonPoints);
  const currentSeasonTier = getCurrentSeasonTier(state.seasonPoints);
  const prestigeTier = PRESTIGE_TIERS.find((tier) => tier.level === state.prestigeLevel + 1) ?? null;
  const canPrestige = prestigeTier !== null && player.level >= prestigeTier.requiredLevel;
  const seasonTierViews: SeasonTierView[] = SeasonPassService.getTierViews(state);
  const claimableSeasonTiers = SeasonPassService.countClaimable(state);

  useMetagameStore.setState({
    state,
    legacy,
    annualGoals,
    collections,
    coreLoop,
    seasonTiers: SEASON_TIERS,
    seasonTierViews,
    claimableSeasonTiers,
    currentSeasonTier,
    nextSeasonTier,
    prestigeTier,
    canPrestige,
    isLoading: false,
  });
};

const ensureSeason = async (state: MetagameStateRecord): Promise<MetagameStateRecord> => {
  const currentKey = getSeasonKey();
  if (state.seasonKey === currentKey) return state;

  return {
    ...state,
    seasonKey: currentKey,
    seasonPoints: 0,
    seasonClaimedTiers: [],
    updatedAt: new Date().toISOString(),
  };
};

const addSeasonPoints = async (points: number): Promise<void> => {
  let state = (await getMetagameState()) ?? defaultState();
  state = await ensureSeason(state);

  const previousTier = getCurrentSeasonTier(state.seasonPoints);
  state = {
    ...state,
    seasonPoints: state.seasonPoints + points,
    updatedAt: new Date().toISOString(),
  };

  await saveMetagameState(state);

  const nextTier = getCurrentSeasonTier(state.seasonPoints);
  if (nextTier > previousTier) {
    GameEvents.emit({ type: 'SEASON_TIER_REACHED', tier: nextTier, seasonKey: state.seasonKey });
  }

  if (usePlayerStore.getState().level >= 50 && state.prestigeLevel < PRESTIGE_TIERS.length) {
    GameEvents.emit({ type: 'PRESTIGE_AVAILABLE', prestigeLevel: state.prestigeLevel + 1 });
  }
};

const handleGameEvent = (event: GameEvent): void => {
  void (async () => {
    if (event.type === 'DAILY_MISSION_COMPLETED') {
      await addSeasonPoints(SEASON_POINTS.DAILY_MISSION);
      return;
    }

    if (event.type === 'WEEKLY_MISSION_CLAIMED') {
      await addSeasonPoints(SEASON_POINTS.WEEKLY_CLAIM);
      return;
    }

    if (event.type === 'STUDY_DAY_RECORDED') {
      await addSeasonPoints(SEASON_POINTS.STUDY_DAY);
      await tryRecordLegacy(
        'first_study_day',
        LegacyCategory.STREAK,
        'Primeiro dia de estudo',
        'Consistência iniciada.',
        new Date().toISOString(),
      );
      return;
    }

    if (event.type === 'CONTRACT_COMPLETED') {
      await addSeasonPoints(SEASON_POINTS.CONTRACT_COMPLETE);
      return;
    }

    if (event.type === 'FOCUS_SESSION_COMPLETED') {
      await addSeasonPoints(SEASON_POINTS.FOCUS_SESSION);
      return;
    }

    if (event.type === 'ACHIEVEMENT_UNLOCKED') {
      await addSeasonPoints(SEASON_POINTS.ACHIEVEMENT);
      return;
    }

    if (event.type === 'CONTRACT_STARTED') {
      await tryRecordLegacy(
        'first_contract',
        LegacyCategory.CONTRACT,
        'Primeiro contrato',
        `Contrato "${event.contractName}" iniciado.`,
        new Date().toISOString(),
      );
      return;
    }

    if (event.type === 'CAREER_PROMOTION') {
      await tryRecordLegacy(
        `promotion_${event.roleKey}`,
        LegacyCategory.CAREER,
        `Promoção: ${event.roleName}`,
        'Marco na carreira internacional.',
        new Date().toISOString(),
      );
      return;
    }

    if (event.type === 'PET_STAGE_EVOLVED' && event.stage === 'baby') {
      await tryRecordLegacy(
        'first_pet',
        LegacyCategory.PET,
        'Primeiro pet',
        'Seu companheiro nasceu!',
        new Date().toISOString(),
      );
    }

    await refreshStore();
  })();
};

export const MetagameService = {
  initListeners: () => {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe(handleGameEvent);
  },

  initialize: async (): Promise<void> => {
    const existing = await getMetagameState();
    if (!existing) {
      await saveMetagameState(defaultState());
    } else {
      const rolled = await ensureSeason(existing);
      if (rolled.seasonKey !== existing.seasonKey) {
        await saveMetagameState(rolled);
      }
    }

    await seedLegacyFromExistingData();
    await refreshStore();
  },

  claimPrestige: async (sacrifice: PrestigeSacrificeValue): Promise<PrestigeAscensionResult> => {
    const result = await PrestigeAscensionService.ascend(sacrifice);
    if (result.success) {
      await refreshStore();
    }
    return result;
  },

  refresh: refreshStore,
  getCoreLoopSnapshot: buildCoreLoopSnapshot,

  claimSeasonTier: async (tier: number) => {
    const result = await SeasonPassService.claimTier(tier);
    if (result.ok) {
      await refreshStore();
    }
    return result;
  },
};
