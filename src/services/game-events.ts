import type { WeeklyMissionType } from '@/types/weekly-mission-type';

import { AppLogService } from './app-log-service';
import {
    appendGameEventToBatch,
    drainGameEventBatch,
    registerCoalescedTask,
    shouldScheduleGameEventFlush,
} from './game-events-batch-policy';

export type GameEvent =
  | {
      type: 'DAILY_MISSION_COMPLETED';
      category?: string;
      missionTitle?: string;
      xpReward?: number;
      coinReward?: number;
    }
  | { type: 'XP_GAINED'; amount: number }
  | { type: 'PLAYER_LEVEL_UP'; level: number; previousLevel: number; levelsGained: number }
  | { type: 'STUDY_DAY_RECORDED' }
  | {
      type: 'WORDS_LEARNED';
      amount: number;
      words?: { term: string; translation: string; sourcePackKey?: string; themeTags?: string[] }[];
    }
  | {
      type: 'LEXICON_BRICK_MINTED';
      brickId: string;
      lemmaId: string;
      lemma: string;
      themeTags: string[];
      source: string;
    }
  | {
      type: 'LEXICON_BRICK_PLACED';
      poiKey: string;
      poiName: string;
      projectKey: string;
      brickId: string;
      lemmaId: string;
      lemma: string;
      themeTag: string;
      weight: number;
    }
  | {
      type: 'LEXICON_BRICK_CRACKED';
      brickId: string;
      lemmaId: string;
      lemma: string;
      decayStage: number;
    }
  | {
      type: 'LEXICON_BRICK_REPAIRED';
      brickId: string;
      lemmaId: string;
      lemma: string;
    }
  | {
      type: 'MEMORY_WALL_COMPLETED';
      poiKey: string;
      poiName: string;
      projectKey: string;
      projectTitle: string;
      targetTotal: number;
    }
  | { type: 'SPEAKING_SESSION_COMPLETED'; amount: number }
  | { type: 'SHIELD_USED'; count: number }
  | { type: 'SHIELD_EARNED'; amount: number }
  | { type: 'WEEKLY_MISSION_CLAIMED' }
  | { type: 'PET_XP_GAINED'; amount: number }
  | { type: 'PET_EXPERIENCE_GRANT'; amount: number }
  | {
      type: 'PET_STAGE_EVOLVED';
      stage: string;
      previousStage: string;
      instanceId?: number;
      nickname?: string;
      speciesKey?: string;
      coinsReward?: number;
    }
  | { type: 'PET_INTERACTION'; interactionType: string; affinityGain: number }
  | { type: 'PET_NAMED'; name: string }
  | { type: 'PET_MEMORY_CREATED'; memoryKey: string; title: string }
  | { type: 'PET_EGG_USED'; speciesKey: string; hatchAt: string }
  | { type: 'PET_FARM_SLOT_CHANGED'; instanceId: number; slotIndex: number }
  | { type: 'PET_ACTIVE_CHANGED'; instanceId: number }
  | { type: 'PET_BRED'; motherInstanceId: number; fatherInstanceId: number; speciesKey: string }
  | {
      type: 'PET_ADVENTURE_STARTED';
      adventureId: number;
      instanceId: number;
      biomeKey: string;
      durationKey: string;
    }
  | {
      type: 'PET_ADVENTURE_CLAIMED';
      adventureId: number;
      instanceId: number;
      success: boolean;
      durationKey: string;
    }
  | {
      type: 'PET_ACADEMY_STARTED';
      sessionId: number;
      instanceId: number;
      trackKey: string;
    }
  | {
      type: 'PET_ACADEMY_CLAIMED';
      sessionId: number;
      instanceId: number;
      trackKey: string;
    }
  | {
      type: 'PET_LEAGUE_BATTLE';
      instanceId: number;
      ghostId: string;
      won: boolean;
      division: string;
    }
  | {
      type: 'PET_LEAGUE_REWARD_CLAIMED';
      tier: string;
      coins: number;
      studyPoints: number;
    }
  | { type: 'PET_HALL_INDUCTED'; instanceId: number; slot: number }
  | { type: 'PET_FAVORITE_CHANGED'; instanceId: number; tag: string }
  | {
      type: 'PET_COSMETIC_GRANTED';
      instanceId: number;
      cosmeticKey: string;
      source: string;
    }
  | {
      type: 'PET_COSMETIC_EQUIPPED';
      instanceId: number;
      cosmeticKey: string;
      slot: string;
    }
  | { type: 'LOOT_BOX_RECEIVED'; rarity: string; source: string }
  | { type: 'LOOT_BOX_OPENED'; result: { boxId: number; boxRarity: string; reward: { type: string; amount: number; label: string } } }
  | {
      type: 'ACHIEVEMENT_UNLOCKED';
      achievementKey: string;
      name: string;
      rewards: { type: string; label: string }[];
    }
  | {
      type: 'SHOP_PURCHASE_COMPLETED';
      productKey: string;
      productName: string;
      category: string;
      pricePaid: number;
      quantity: number;
    }
  | {
      type: 'TITLE_UNLOCKED';
      titleKey: string;
      titleName: string;
      levelAtUnlock: number;
    }
  | {
      type: 'CITY_BUILDING_UNLOCKED';
      buildingKey: string;
      buildingName: string;
      levelAtUnlock: number;
    }
  | {
      type: 'POI_VISITED';
      poiKey: string;
      poiName: string;
    }
  | {
      type: 'DISTRICT_UNLOCKED';
      districtKey: string;
      districtName: string;
      playerLevel: number;
    }
  | {
      type: 'LOCAL_MISSION_COMPLETED';
      poiKey: string;
      poiName: string;
      missionTitle: string;
      xpReward: number;
      coinReward: number;
      localXpReward: number;
    }
  | {
      type: 'POI_LEVEL_UP';
      poiKey: string;
      poiName: string;
      newLocalLevel: number;
      maxLocalLevel: number;
    }
  | {
      type: 'CITY_RESOURCE_EARNED';
      resourceType: string;
      amount: number;
      source: string;
      newBalance: number;
    }
  | {
      type: 'CITY_RESOURCE_DELIVERED';
      poiKey: string;
      poiName: string;
      resourceType: string;
      amount: number;
      projectKey: string;
      progress: number;
      targetTotal: number;
    }
  | {
      type: 'POI_PROJECT_COMPLETED';
      poiKey: string;
      poiName: string;
      projectKey: string;
      projectTitle: string;
      resourceType: string;
      targetTotal: number;
    }
  | { type: 'CITY_EVENT_STARTED'; eventKey: string; eventName: string }
  | { type: 'CITY_EVENT_ENDED'; eventKey: string }
  | {
      type: 'EVENT_VOCAB_LEARNED';
      eventKey: string;
      amount: number;
      totalLearned: number;
      target: number;
    }
  | {
      type: 'CITY_EVENT_MILESTONE';
      eventKey: string;
      milestone: number;
      spiritProgress: number;
    }
  | {
      type: 'CITY_EVENT_MISSION_COMPLETED';
      eventKey: string;
      poiKey: string;
      missionTitle: string;
    }
  | {
      type: 'POI_NPC_TRUST_CHANGED';
      poiKey: string;
      trust: number;
      band: string;
      delta: number;
    }
  | {
      type: 'POI_CHAIN_STEP_CLAIMED';
      poiKey: string;
      chainKey: string;
      stepIndex: number;
      chainTitle: string;
    }
  | {
      type: 'POI_CHAIN_COMPLETED';
      poiKey: string;
      chainKey: string;
      chainTitle: string;
    }
  | {
      type: 'STREAK_BROKEN';
    }
  | {
      type: 'CONTRACT_STARTED';
      contractKey: string;
      contractName: string;
      targetDays: number;
      stakeAmount: number;
      issuerPoiKey: string;
    }
  | {
      type: 'CONTRACT_COMPLETED';
      contractKey: string;
      contractName: string;
      targetDays: number;
      stakeAmount: number;
      issuerPoiKey: string;
    }
  | {
      type: 'CONTRACT_FAILED';
      contractKey: string;
      contractName: string;
      stakeAmount: number;
      issuerPoiKey: string;
    }
  | { type: 'CAREER_PROMOTION'; roleKey: string; roleName: string; level: number }
  | { type: 'CAREER_INTERVIEW_COMPLETED'; interviewKey: string; interviewName: string }
  | { type: 'JOB_OFFER_UNLOCKED'; offerKey: string; offerName: string }
  | { type: 'CAREER_COMPANY_UNLOCKED'; companyKey: string; companyName: string }
  | { type: 'DREAM_MILESTONE'; dreamKey: string; dreamName: string; completed: boolean }
  | { type: 'LEGACY_MILESTONE'; milestoneKey: string; title: string }
  | { type: 'SEASON_TIER_REACHED'; tier: number; seasonKey: string }
  | { type: 'SEASON_REWARD_CLAIMED'; tier: number; label: string }
  | { type: 'PRESTIGE_AVAILABLE'; prestigeLevel: number }
  | {
      type: 'PRESTIGE_ASCENDED';
      tierLevel: number;
      tierName: string;
      tierRoman: string;
      sacrifice: string;
      previousPlayerLevel: number;
    }
  | { type: 'STUDY_POINTS_EARNED'; amount: number; reason: string; source: string }
  | {
      type: 'FARM_ACTIVITY_RECORDED';
      activityType: string;
      amount: number;
      studyPointsEarned: number;
      coinsEarned: number;
    }
  | {
      type: 'COLLECTIBLE_DISCOVERED';
      itemKey: string;
      name: string;
      category: string;
      rarity: string;
    }
  | {
      type: 'FOCUS_SESSION_STARTED';
      sessionId: number;
      studyType: string;
      plannedDurationSec: number;
    }
  | {
      type: 'FOCUS_SESSION_COMPLETED';
      sessionId: number;
      rewards: {
        xp: number;
        coins: number;
        studyPoints: number;
        bonusMultiplier: number;
        lootBoxRarity: string | null;
        petAffinityGain: number;
        focusRatio: number;
      };
      focusedSeconds: number;
      distractedSeconds: number;
    }
  | { type: 'FOCUS_SESSION_ABANDONED'; sessionId: number; reason: string }
  | {
      type: 'DUEL_WON';
      sessionId: string;
      mode: string;
      flawless: boolean;
      questionCount: number;
      correctCount: number;
      newLemmaCount: number;
    }
  | {
      type: 'DUEL_LOST';
      sessionId: string;
      mode: string;
      questionCount: number;
      correctCount: number;
    }
  | {
      type: 'FLASH_SESSION_DONE';
      sessionId: string;
      deckId: string;
      cardsReviewed: number;
      mode: string;
    }
  | {
      type: 'PATENT_PROMOTED';
      previousPatent: string;
      newPatent: string;
    }
  | {
      type: 'FOCUS_DISTRACTION_RECORDED';
      sessionId: number;
      packageName: string;
      durationSec: number;
    }
  | {
      type: 'PUNISHMENT_WARNING';
      trigger: string;
      severity: string;
      message: string;
    }
  | {
      type: 'PUNISHMENT_APPLIED';
      trigger: string;
      severity: string;
      xpDecayPercent: number;
      coinDecayPercent: number;
    }
  | {
      type: 'PUNISHMENT_RECOVERED';
      recoveryDays: number;
      bonusXp: number;
      allCleared: boolean;
    }
  | { type: 'ROUTINE_CREATED'; routineId: string; templateKey: string | null }
  | {
      type: 'ROUTINE_COMPLETED';
      routineId: string;
      routineName: string;
      category: string;
      frequency: string;
      periodKey: string;
      xp: number;
      coins: number;
      studyPoints: number;
      currentStreak: number;
    }
  | {
      type: 'ROUTINE_MISSED';
      routineId: string;
      routineName: string;
      periodKey: string;
    }
  | {
      type: 'JOURNAL_ENTRY_CREATED';
      entryId: string;
      entryType: string;
      category: string;
      isVoice: boolean;
      xp: number;
    }
  | {
      type: 'JOURNAL_ENTRY_REVIEWED';
      entryId: string;
      reviewStage: number;
      xp: number;
    }
  | {
      type: 'JOURNAL_VOICE_REPLAYED';
      entryId: string;
      xp: number;
    }
  | { type: 'JOURNAL_LINK_CREATED'; fromId: string; count: number }
  | { type: 'JOURNAL_COLLECTION_UPDATED'; entryId: string; collectionCount: number }
  | { type: 'JOURNAL_LIBRARY_TIER_UP'; tier: number; knowledgePoints: number }
  | { type: 'MOTIVATION_SPARK_CREATED'; sparkId: string }
  | { type: 'MOTIVATION_SPARK_UPDATED'; sparkId: string }
  | { type: 'MOTIVATION_SPARK_DELETED'; sparkId: string }
  | {
      type: 'LEARNING_BLOCK_COMPLETED';
      blockId: string;
      skillKey: string;
      minutes: number;
      skillGain: number;
      worldProgressGain: number;
    }
  | { type: 'LEARNING_UNIT_COMPLETED'; unitKey: string; worldKey: string }
  | { type: 'LEARNING_WORLD_ADVANCED'; fromWorldKey: string; toWorldKey: string }
  | { type: 'MOTIVATION_DAILY_PICKED'; sparkId: string; dateKey: string }
  | { type: 'MOTIVATION_SPARK_OPENED'; sparkId: string; dateKey: string }
  | {
      type: 'MOTIVATION_OPEN_STREAK_UPDATED'
      current: number
      best: number
      totalOpens: number
    }
  | { type: 'MENTOR_CHAT_STARTED'; sessionId: string; mode: string }
  | { type: 'MENTOR_CORRECTION_APPLIED'; errorId: string; category: string }
  | { type: 'MENTOR_EXERCISE_COMPLETED'; sessionId: string }
  | { type: 'MENTOR_ROLEPLAY_COMPLETED'; sessionId: string; turns: number }
  | { type: 'MENTOR_MISSION_ACCEPTED'; missionId: string }
  | { type: 'MENTOR_MISSION_COMPLETED'; missionId: string }
  | { type: 'MENTOR_SESSION_COMPLETED'; sessionId: string; durationMinutes: number };

type GameEventListener = (event: GameEvent) => void | Promise<void>;
type CoalescedAfterBatchTask = () => void | Promise<void>;

const listeners = new Set<GameEventListener>();

let pendingEvents: GameEvent[] = [];
let flushScheduled = false;
let coalescedAfterBatch = new Set<CoalescedAfterBatchTask>();

const dispatchToListeners = (event: GameEvent): void => {
  listeners.forEach((listener) => {
    try {
      const result = listener(event);
      if (result && typeof (result as Promise<void>).then === 'function') {
        void (result as Promise<void>).catch((error) => {
          AppLogService.warn('game_events.listener_failed', 'Game event listener rejected', {
            type: event.type,
            message: error instanceof Error ? error.message : String(error),
          });
        });
      }
    } catch (error) {
      AppLogService.warn('game_events.listener_failed', 'Game event listener threw', {
        type: event.type,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  });
};

const runCoalescedAfterBatchTasks = (): void => {
  if (coalescedAfterBatch.size === 0) return;

  const tasks = [...coalescedAfterBatch];
  coalescedAfterBatch = new Set();

  for (const task of tasks) {
    try {
      const result = task();
      if (result && typeof (result as Promise<void>).then === 'function') {
        void (result as Promise<void>).catch((error) => {
          AppLogService.warn('game_events.coalesced_task_failed', 'Coalesced task rejected', {
            message: error instanceof Error ? error.message : String(error),
          });
        });
      }
    } catch (error) {
      AppLogService.warn('game_events.coalesced_task_failed', 'Coalesced task threw', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

const flushPendingEvents = (): void => {
  flushScheduled = false;

  const { events } = drainGameEventBatch(pendingEvents);
  pendingEvents = [];

  for (const event of events) {
    dispatchToListeners(event);
  }

  runCoalescedAfterBatchTasks();

  if (pendingEvents.length > 0) {
    flushScheduled = true;
    queueMicrotask(flushPendingEvents);
  }
};

export const GameEvents = {
  subscribe(listener: GameEventListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Agrupa emits síncronos no mesmo microtask e deduplica tarefas pesadas
   * agendadas via scheduleCoalescedAfterBatch (P-43).
   */
  emit(event: GameEvent): void {
    pendingEvents = appendGameEventToBatch(pendingEvents, event);

    if (!shouldScheduleGameEventFlush(flushScheduled)) return;

    flushScheduled = true;
    queueMicrotask(flushPendingEvents);
  },

  scheduleCoalescedAfterBatch(task: CoalescedAfterBatchTask): void {
    coalescedAfterBatch = registerCoalescedTask(coalescedAfterBatch, task);
  },
};

export type { WeeklyMissionType };
