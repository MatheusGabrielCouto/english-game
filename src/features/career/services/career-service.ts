import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { useCityStore } from '@/features/city/store/city-store';
import { PlayerService } from '@/features/player/services/player-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { CareerEventType, type CareerEventTypeValue, type CareerProgressRecord } from '@/types/career';
import { GameEvents, type GameEvent } from '@/services/game-events';
import {
  addCareerEvent,
  getCareerProgress,
  getRecentCareerEvents,
  saveCareerProgress,
} from '@/storage/repositories/career-repository';

import {
  CAREER_INTERVIEWS,
  CAREER_JOB_OFFERS,
  ROLES_BY_KEY,
} from '../constants/career-catalog';
import { useCareerStore } from '../store/career-store';
import {
  buildCareerJourneyProgress,
  buildDreamProgress,
  buildInterviewProgress,
  buildJobOfferProgress,
  resolveBestCompany,
  resolveRoleForLevel,
} from '../utils/progress';

let listenersInitialized = false;

const defaultProgress = (): CareerProgressRecord => ({
  currentRoleKey: 'student',
  currentCompanyKey: 'startup_local',
  englishScore: 0,
  completedInterviews: [],
  unlockedOffers: [],
  dreamProgress: {},
  promotionsCount: 0,
  updatedAt: new Date().toISOString(),
});

const refreshStore = async (): Promise<void> => {
  const player = usePlayerStore.getState();
  const progress = (await getCareerProgress()) ?? defaultProgress();
  const achievementsUnlocked = useAchievementsStore.getState().summary.unlocked;
  const citySummary = useCityStore.getState().summary;
  const cityPercent =
    citySummary.total > 0 ? Math.round((citySummary.unlocked / citySummary.total) * 100) : 0;
  const events = await getRecentCareerEvents(15);

  useCareerStore.setState({
    progress,
    journey: buildCareerJourneyProgress(player.level, progress),
    interviews: buildInterviewProgress(player.level, progress.englishScore, progress.completedInterviews),
    dreams: buildDreamProgress({
      currentStreak: player.currentStreak,
      coins: player.coins,
      level: player.level,
      cityPercent,
      dreamProgress: progress.dreamProgress,
    }),
    offers: buildJobOfferProgress({
      level: player.level,
      englishScore: progress.englishScore,
      achievementsUnlocked,
      unlockedOffers: progress.unlockedOffers,
    }),
    events,
    isLoading: false,
  });
};

const recordEvent = async (
  eventType: CareerEventTypeValue,
  eventKey: string,
  title: string,
  description: string,
): Promise<void> => {
  await addCareerEvent({
    eventType,
    eventKey,
    title,
    description,
    occurredAt: new Date().toISOString(),
  });
};

const syncCareerFromPlayer = async (): Promise<void> => {
  const player = usePlayerStore.getState();
  const achievementsUnlocked = useAchievementsStore.getState().summary.unlocked;
  let progress = (await getCareerProgress()) ?? defaultProgress();

  const resolvedRole = resolveRoleForLevel(player.level);
  const resolvedCompany = resolveBestCompany({
    level: player.level,
    currentStreak: player.currentStreak,
    currentRoleKey: resolvedRole.key,
    achievementsUnlocked,
  });

  if (resolvedRole.key !== progress.currentRoleKey) {
    const previousRole = ROLES_BY_KEY[progress.currentRoleKey];
    progress = {
      ...progress,
      currentRoleKey: resolvedRole.key,
      promotionsCount: progress.promotionsCount + 1,
    };
    await recordEvent(
      CareerEventType.PROMOTION,
      resolvedRole.key,
      `Promoção: ${resolvedRole.name}`,
      previousRole ? `De ${previousRole.name} para ${resolvedRole.name}.` : resolvedRole.description,
    );
    GameEvents.emit({
      type: 'CAREER_PROMOTION',
      roleKey: resolvedRole.key,
      roleName: resolvedRole.name,
      level: player.level,
    });
  }

  if (resolvedCompany.key !== progress.currentCompanyKey) {
    progress = { ...progress, currentCompanyKey: resolvedCompany.key };
    await recordEvent(
      CareerEventType.COMPANY,
      resolvedCompany.key,
      resolvedCompany.name,
      resolvedCompany.description,
    );
    GameEvents.emit({
      type: 'CAREER_COMPANY_UNLOCKED',
      companyKey: resolvedCompany.key,
      companyName: resolvedCompany.name,
    });
  }

  for (const interview of CAREER_INTERVIEWS) {
    if (progress.completedInterviews.includes(interview.key)) continue;
    if (player.level < interview.requiredLevel) continue;
    if (progress.englishScore < interview.targetCareerMissions) continue;

    progress = {
      ...progress,
      completedInterviews: [...progress.completedInterviews, interview.key],
    };
    PlayerService.addXP(interview.rewardXp);
    PlayerService.addCoins(interview.rewardCoins);
    await recordEvent(
      CareerEventType.INTERVIEW,
      interview.key,
      interview.name,
      'Entrevista concluída com sucesso!',
    );
    GameEvents.emit({
      type: 'CAREER_INTERVIEW_COMPLETED',
      interviewKey: interview.key,
      interviewName: interview.name,
    });
  }

  for (const offer of CAREER_JOB_OFFERS) {
    if (progress.unlockedOffers.includes(offer.key)) continue;
    const eligible =
      player.level >= offer.requiredLevel &&
      (offer.requiredEnglishScore === undefined || progress.englishScore >= offer.requiredEnglishScore) &&
      (offer.requiredAchievements === undefined || achievementsUnlocked >= offer.requiredAchievements);

    if (!eligible) continue;

    progress = {
      ...progress,
      unlockedOffers: [...progress.unlockedOffers, offer.key],
    };
    await recordEvent(CareerEventType.JOB_OFFER, offer.key, offer.name, offer.description);
    GameEvents.emit({
      type: 'JOB_OFFER_UNLOCKED',
      offerKey: offer.key,
      offerName: offer.name,
    });
  }

  const citySummary = useCityStore.getState().summary;
  const cityPercent =
    citySummary.total > 0 ? Math.round((citySummary.unlocked / citySummary.total) * 100) : 0;
  const dreams = buildDreamProgress({
    currentStreak: player.currentStreak,
    coins: player.coins,
    level: player.level,
    cityPercent,
    dreamProgress: progress.dreamProgress,
  });

  for (const dream of dreams) {
    const wasCompleted = progress.dreamProgress[dream.key] === dream.target;
    if (dream.completed && !wasCompleted) {
      progress = {
        ...progress,
        dreamProgress: { ...progress.dreamProgress, [dream.key]: dream.target },
      };
      await recordEvent(CareerEventType.DREAM, dream.key, dream.name, 'Sonho alcançado!');
      GameEvents.emit({
        type: 'DREAM_MILESTONE',
        dreamKey: dream.key,
        dreamName: dream.name,
        completed: true,
      });
    }
  }

  await saveCareerProgress(progress);
  await refreshStore();
};

const handleGameEvent = (event: GameEvent): void => {
  void (async () => {
    if (event.type === 'PLAYER_LEVEL_UP') {
      await syncCareerFromPlayer();
      return;
    }

    if (event.type === 'DAILY_MISSION_COMPLETED' && event.category === 'career_english') {
      const progress = (await getCareerProgress()) ?? defaultProgress();
      await saveCareerProgress({
        ...progress,
        englishScore: progress.englishScore + 1,
      });
      await syncCareerFromPlayer();
      return;
    }

    if (
      event.type === 'STUDY_DAY_RECORDED' ||
      event.type === 'CONTRACT_STARTED' ||
      event.type === 'ACHIEVEMENT_UNLOCKED'
    ) {
      await syncCareerFromPlayer();
    }
  })();
};

export const CareerService = {
  initListeners: () => {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe(handleGameEvent);
  },

  initialize: async (): Promise<void> => {
    const existing = await getCareerProgress();
    if (!existing) {
      await saveCareerProgress(defaultProgress());
    }
    await syncCareerFromPlayer();
    await refreshStore();
  },

  refresh: refreshStore,
};
