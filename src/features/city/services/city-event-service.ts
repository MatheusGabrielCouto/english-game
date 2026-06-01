import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import { CONTRACTS_BY_KEY } from '@/data/loaders/contracts';
import {
    POI_EVENT_MISSION_TEMPLATES_BY_POI,
    type PoiEventMissionTemplate,
} from '@/data/loaders/poi-event-missions';
import {
    EVENT_VOCAB_DISPLAY_TARGET,
    FESTIVE_SPIRIT_MILESTONES,
    SPIRIT_PER_EVENT_CONTRACT_COMPLETE,
    SPIRIT_PER_EVENT_MISSION_CLAIM,
    SPIRIT_PER_EVENT_VOCAB_WORD,
} from '@/features/city/constants/city-event-config';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { MissionDifficultyTier } from '@/features/game-design/constants/mission-types';
import { scaleCoins, scaleReward } from '@/features/game-design/utils/reward-scaling';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityEventRepository } from '@/storage/repositories/city-event-repository';
import { CityPoiMissionRepository } from '@/storage/repositories/city-poi-mission-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import type { ActiveCityEventViewModel, CityEventDefinition, CityEventStateRecord } from '@/types/city-event';
import type { CityPoiMission } from '@/types/city-poi-mission';
import { LocalMissionType } from '@/types/city-poi-mission';

import { useCityMapStore } from '../store/city-map-store';
import { CityEventScheduler } from './city-event-scheduler';
import { CityMapService } from './city-map-service';

let listenersInitialized = false;
let lastSyncedEventKey: string | null = null;

const buildEventMission = async (
  template: PoiEventMissionTemplate,
  eventKey: string,
  missionDate: string,
): Promise<CityPoiMission> => {
  const difficulty = await getLearningDifficulty();
  const tier = template.difficulty ?? MissionDifficultyTier.MEDIUM;

  return {
    id: `${eventKey}-${template.poiKey}-${missionDate}-${template.templateKey}`,
    poiKey: template.poiKey,
    missionDate,
    templateKey: template.templateKey,
    title: template.title,
    description: template.description,
    missionType: template.missionType,
    targetValue: template.targetValue,
    currentValue: 0,
    xpReward: scaleReward(template.baseXp, tier, difficulty),
    coinReward: scaleCoins(template.baseCoins, tier, difficulty),
    localXpReward: Math.max(
      10,
      Math.round(template.baseLocalXp * getDifficultyConfig(difficulty).xpMultiplier),
    ),
    completed: false,
    claimed: false,
    createdAt: new Date().toISOString(),
    eventKey,
    chainKey: null,
    chainStep: null,
  };
};

const milestonesReached = (spirit: number): number[] =>
  FESTIVE_SPIRIT_MILESTONES.filter((m) => spirit >= m);

const toViewModel = (
  event: CityEventDefinition,
  state: CityEventStateRecord,
  now: Date,
): ActiveCityEventViewModel => ({
  eventKey: event.eventKey,
  name: event.name,
  tabLabel: event.tabLabel,
  emoji: event.emoji,
  description: event.description,
  spiritLabel: event.spiritLabel,
  mapThemeKey: event.mapThemeKey,
  daysRemaining: CityEventScheduler.getDaysRemaining(event, now),
  spiritProgress: state.spiritProgress,
  vocabWordsLearned: state.vocabWordsLearned,
  vocabTarget: EVENT_VOCAB_DISPLAY_TARGET,
  introSeen: state.introSeen,
  milestonesReached: milestonesReached(state.spiritProgress),
  participatingPoiKeys: event.participatingPoiKeys,
  temporaryPoiKeys: event.temporaryPoiKeys,
});

const unlockTemporaryPois = async (event: CityEventDefinition): Promise<void> => {
  const player = await getOrCreatePlayer();
  const now = new Date().toISOString();

  for (const poiKey of event.temporaryPoiKeys) {
    const definition = CITY_POIS_BY_KEY[poiKey];
    if (!definition) continue;
    if (player.level < definition.requiredPlayerLevel) continue;

    const existing = await CityPoiRepository.findByKey(poiKey);
    if (existing?.unlockedAt) continue;

    await CityPoiRepository.upsert({
      poiKey,
      districtKey: definition.districtKey,
      category: definition.category,
      localLevel: existing?.localLevel ?? 1,
      localXp: existing?.localXp ?? 0,
      positionX: definition.positionX,
      positionY: definition.positionY,
      unlockedAt: now,
      visualStage: existing?.visualStage ?? 1,
      npcTrust: existing?.npcTrust ?? 50,
    });
  }
};

const ensureEventState = async (event: CityEventDefinition): Promise<CityEventStateRecord> => {
  const existing = await CityEventRepository.findByKey(event.eventKey);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: CityEventStateRecord = {
    eventKey: event.eventKey,
    spiritProgress: 0,
    vocabWordsLearned: 0,
    introSeen: false,
    completedAt: null,
    startedAt: now,
    updatedAt: now,
  };
  await CityEventRepository.upsert(created);
  return created;
};

const addSpirit = async (eventKey: string, amount: number): Promise<void> => {
  if (amount <= 0) return;

  const state = await CityEventRepository.findByKey(eventKey);
  if (!state) return;

  const previous = state.spiritProgress;
  const next = Math.min(100, previous + amount);
  const now = new Date().toISOString();

  await CityEventRepository.upsert({
    ...state,
    spiritProgress: next,
    updatedAt: now,
    completedAt: next >= 100 ? now : state.completedAt,
  });

  for (const milestone of FESTIVE_SPIRIT_MILESTONES) {
    if (previous < milestone && next >= milestone) {
      GameEvents.emit({
        type: 'CITY_EVENT_MILESTONE',
        eventKey,
        milestone,
        spiritProgress: next,
      });
    }
  }
};

const bumpEventVocabMissions = async (eventKey: string, delta: number): Promise<void> => {
  const today = getTodayKey();
  const missions = await CityPoiMissionRepository.findEventMissionsByDate(eventKey, today);

  let changed = false;
  for (const mission of missions) {
    if (mission.claimed || mission.missionType !== LocalMissionType.LEARN_EVENT_VOCAB) continue;

    const newValue = Math.min(mission.targetValue, mission.currentValue + delta);
    if (newValue === mission.currentValue) continue;

    const completed = newValue >= mission.targetValue;
    await CityPoiMissionRepository.updateProgress(mission.id, newValue, completed);
    changed = true;
  }

  if (changed) await CityMapService.refresh();
};

export const CityEventService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      void CityEventService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    const active = CityEventScheduler.getActiveMajorEvent();
    if (!active) return;

    if (event.type === 'WORDS_LEARNED') {
      const state = await ensureEventState(active);
      const cap = EVENT_VOCAB_DISPLAY_TARGET;
      const room = cap - state.vocabWordsLearned;
      if (room <= 0) return;

      const add = Math.min(room, event.amount * SPIRIT_PER_EVENT_VOCAB_WORD);
      const now = new Date().toISOString();
      await CityEventRepository.upsert({
        ...state,
        vocabWordsLearned: state.vocabWordsLearned + add,
        updatedAt: now,
      });

      GameEvents.emit({
        type: 'EVENT_VOCAB_LEARNED',
        eventKey: active.eventKey,
        amount: add,
        totalLearned: state.vocabWordsLearned + add,
        target: cap,
      });

      await bumpEventVocabMissions(active.eventKey, add);
      await CityEventService.syncActiveEvent();
      return;
    }

    if (event.type === 'CONTRACT_COMPLETED') {
      const definition = CONTRACTS_BY_KEY[event.contractKey];
      if (definition?.eventKey === active.eventKey) {
        await addSpirit(active.eventKey, SPIRIT_PER_EVENT_CONTRACT_COMPLETE);
        await CityEventService.syncActiveEvent();
      }
    }
  },

  async onEventMissionClaimed(eventKey: string): Promise<void> {
    await addSpirit(eventKey, SPIRIT_PER_EVENT_MISSION_CLAIM);
    await CityEventService.syncActiveEvent();
  },

  async markIntroSeen(eventKey: string): Promise<void> {
    const state = await CityEventRepository.findByKey(eventKey);
    if (!state || state.introSeen) return;

    await CityEventRepository.upsert({
      ...state,
      introSeen: true,
      updatedAt: new Date().toISOString(),
    });
    await CityEventService.syncActiveEvent();
  },

  async ensureEventMissions(
    eventKey: string,
    missionDate: string = getTodayKey(),
  ): Promise<void> {
    const event = CityEventScheduler.getActiveMajorEvent();
    if (!event || event.eventKey !== eventKey) return;

    const player = await getOrCreatePlayer();

    for (const poiKey of event.participatingPoiKeys) {
      const poiRecord = await CityPoiRepository.findByKey(poiKey);
      const localLevel = poiRecord?.localLevel ?? 1;
      const templates = (POI_EVENT_MISSION_TEMPLATES_BY_POI[poiKey] ?? []).filter(
        (t) => t.minLocalLevel <= localLevel,
      );
      if (templates.length === 0) continue;

      const existing = await CityPoiMissionRepository.findByPoiDateAndEvent(
        poiKey,
        missionDate,
        eventKey,
      );
      if (existing.length > 0) continue;

      const poi = await CityPoiRepository.findByKey(poiKey);
      if (!poi?.unlockedAt && !event.temporaryPoiKeys.includes(poiKey)) continue;
      if (player.level < (CITY_POIS_BY_KEY[poiKey]?.requiredPlayerLevel ?? 1)) continue;

      for (const template of templates) {
        const mission = await buildEventMission(template, eventKey, missionDate);
        await CityPoiMissionRepository.insert(mission);
      }
    }
  },

  async syncActiveEvent(): Promise<ActiveCityEventViewModel | null> {
    const now = new Date();
    const event = CityEventScheduler.getActiveMajorEvent(now);

    if (!event) {
      if (lastSyncedEventKey) {
        GameEvents.emit({ type: 'CITY_EVENT_ENDED', eventKey: lastSyncedEventKey });
        lastSyncedEventKey = null;
      }
      useCityMapStore.setState({ activeCityEvent: null });
      return null;
    }

    const isNew = lastSyncedEventKey !== event.eventKey;
    if (isNew) {
      lastSyncedEventKey = event.eventKey;
      GameEvents.emit({ type: 'CITY_EVENT_STARTED', eventKey: event.eventKey, eventName: event.name });
      await unlockTemporaryPois(event);
    }

    const state = await ensureEventState(event);
    await CityEventService.ensureEventMissions(event.eventKey);
    const viewModel = toViewModel(event, state, now);
    useCityMapStore.setState({ activeCityEvent: viewModel });
    return viewModel;
  },

  async initialize(): Promise<void> {
    await CityEventService.syncActiveEvent();
  },

  getActiveEventFromStore(): ActiveCityEventViewModel | null {
    return useCityMapStore.getState().activeCityEvent;
  },

  isPoiParticipating(poiKey: string): boolean {
    const active = useCityMapStore.getState().activeCityEvent;
    return active?.participatingPoiKeys.includes(poiKey) ?? false;
  },
};
