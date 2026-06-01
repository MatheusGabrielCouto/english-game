import { AppState, type AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';

import { grantLootBoxReward } from '@/features/loot-boxes/services/loot-box-grant';
import type { LootBoxRarityValue } from '@/types/inventory';
import { PetService } from '@/features/pet/services/pet-service';
import { PlayerService } from '@/features/player/services/player-service';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { StudyService } from '@/features/weekly-quests/services/study-service';
import { GameEvents } from '@/services/game-events';
import {
  appendFocusSessionEvent,
  createFocusSession,
  getActiveFocusSession,
  updateFocusSession,
} from '@/storage/repositories/focus-session-repository';
import {
  getEnabledBlockedPackageNames,
  seedDefaultBlockedApps,
} from '@/storage/repositories/focus-blocked-apps-repository';
import { getOrCreateFocusAnalytics, recordFocusAnalytics } from '@/storage/repositories/focus-analytics-repository';
import { getOrCreateFocusSettings, saveFocusSettings } from '@/storage/repositories/focus-settings-repository';
import {
  FocusSessionEventType,
  FocusSessionStatus,
  type FocusLiveSessionState,
  type FocusSession,
  type FocusSessionRewards,
  type FocusSettings,
  type FocusStudyTypeValue,
} from '@/types/focus-mode';

import { AppLogService } from '@/services/app-log-service';

import { FOCUS_MESSAGES } from '../constants/focus-config';
import { FocusMonitorBridge } from './focus-monitor-bridge';
import { useFocusModeStore } from '../store/focus-mode-store';
import { computeFocusRewards, plannedMinutesFromSession } from '../utils/focus-rewards';

const FALLBACK_SETTINGS: FocusSettings = {
  enabled: true,
  defaultDurationMinutes: 30,
  hardcoreMode: false,
  monitoringEnabled: true,
  accessibilityDisclosureAccepted: false,
  updatedAt: new Date().toISOString(),
};

type TrackingState = FocusLiveSessionState['trackingState'];

let tickInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let monitorUnsubscribe: (() => void) | null = null;
let lastTickAt = Date.now();
let trackingState: TrackingState = 'idle';
let currentDistractionPackage: string | null = null;
let blockedPackages = new Set<string>();
let distractionStartedAt: number | null = null;
let lastReportedDistractionPackage: string | null = null;
const completingSessionIds = new Set<number>();

const syncNativeTracking = async (session: FocusSession): Promise<FocusSession> => {
  const snapshot = await FocusMonitorBridge.getTrackingSnapshot();
  if (!snapshot) return session;

  if (snapshot.trackingState !== 'paused') {
    trackingState = snapshot.trackingState;
  }

  if (snapshot.isDistracted) {
    currentDistractionPackage = snapshot.packageName;
    if (lastReportedDistractionPackage !== snapshot.packageName) {
      lastReportedDistractionPackage = snapshot.packageName;
      distractionStartedAt = Date.now();
      await appendFocusSessionEvent({
        sessionId: session.id,
        eventType: FocusSessionEventType.DISTRACTION_START,
        packageName: snapshot.packageName,
      });
      GameEvents.emit({
        type: 'FOCUS_DISTRACTION_RECORDED',
        sessionId: session.id,
        packageName: snapshot.packageName,
        durationSec: 0,
      });
    }
  } else if (lastReportedDistractionPackage && distractionStartedAt) {
    const durationSec = Math.max(1, Math.round((Date.now() - distractionStartedAt) / 1000));
    await appendFocusSessionEvent({
      sessionId: session.id,
      eventType: FocusSessionEventType.DISTRACTION_END,
      packageName: lastReportedDistractionPackage,
      durationSec,
    });
    lastReportedDistractionPackage = null;
    distractionStartedAt = null;
    currentDistractionPackage = null;
  }

  if (snapshot.distractedSeconds === session.distractedSeconds) {
    return session;
  }

  return (
    (await updateFocusSession(session.id, {
      distractedSeconds: snapshot.distractedSeconds,
    })) ?? session
  );
};

const clearTimers = () => {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
  appStateSubscription?.remove();
  appStateSubscription = null;
  monitorUnsubscribe?.();
  monitorUnsubscribe = null;
  lastReportedDistractionPackage = null;
  distractionStartedAt = null;
};

const syncLiveState = async (session: FocusSession) => {
  const elapsedSec = session.focusedSeconds + session.distractedSeconds + session.idleSeconds + session.pauseSeconds;
  const remainingSec = Math.max(0, session.plannedDurationSec - elapsedSec);

  useFocusModeStore.setState({
    liveSession: {
      session,
      elapsedSec,
      remainingSec,
      trackingState,
      currentDistractionPackage,
      distractionMessage: null,
    },
  });

  if (remainingSec <= 0 && session.status === FocusSessionStatus.ACTIVE) {
    await FocusModeService.completeSession(session.id);
  }
};

const applyTick = async (session: FocusSession, deltaSec: number): Promise<FocusSession> => {
  if (deltaSec <= 0) return session;

  const synced = await syncNativeTracking(session);
  const nextTrackingState = trackingState === 'paused' ? 'paused' : trackingState;

  const updated = await updateFocusSession(synced.id, {
    focusedSeconds: synced.focusedSeconds + (nextTrackingState === 'focusing' ? deltaSec : 0),
    idleSeconds: synced.idleSeconds + (nextTrackingState === 'idle' ? deltaSec : 0),
    pauseSeconds: synced.pauseSeconds + (nextTrackingState === 'paused' ? deltaSec : 0),
    distractedSeconds: synced.distractedSeconds,
  });

  return updated ?? synced;
};

const handleForegroundPackage = async (packageName: string, session: FocusSession) => {
  void packageName;
  const synced = await syncNativeTracking(session);
  await syncLiveState(synced);
};

const handleAppState = async (nextState: AppStateStatus, session: FocusSession) => {
  if (nextState === 'active') {
    await appendFocusSessionEvent({
      sessionId: session.id,
      eventType: FocusSessionEventType.APP_FOREGROUND,
    });
  } else {
    await appendFocusSessionEvent({
      sessionId: session.id,
      eventType: FocusSessionEventType.APP_BACKGROUND,
    });
  }

  const synced = await syncNativeTracking(session);
  await syncLiveState(synced);
};

const resumeActiveSession = async (active: FocusSession, monitoringEnabled: boolean): Promise<void> => {
  blockedPackages = new Set(await getEnabledBlockedPackageNames());
  trackingState = active.status === FocusSessionStatus.PAUSED ? 'paused' : 'focusing';

  if (monitoringEnabled) {
    try {
      await FocusMonitorBridge.startMonitoring([...blockedPackages]);
      monitorUnsubscribe = FocusMonitorBridge.onForegroundApp((packageName) => {
        void getActiveFocusSession().then((current) => {
          if (current) void handleForegroundPackage(packageName, current);
        });
      });
    } catch (error) {
      AppLogService.warn('focus-mode.monitoring.resume_failed', 'Could not resume native monitoring', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  appStateSubscription = AppState.addEventListener('change', (state) => {
    void getActiveFocusSession().then((current) => {
      if (current) void handleAppState(state, current);
    });
  });
  startTickLoop(active);
  await syncLiveState(active);
};

const startTickLoop = (session: FocusSession) => {
  lastTickAt = Date.now();
  tickInterval = setInterval(() => {
    void (async () => {
      const active = await getActiveFocusSession();
      if (!active || active.id !== session.id) {
        clearTimers();
        return;
      }

      const now = Date.now();
      const deltaSec = Math.min(5, Math.round((now - lastTickAt) / 1000));
      lastTickAt = now;

      const updated = await applyTick(active, deltaSec);
      await syncLiveState(updated);
    })();
  }, 1000);
};

const completeFocusSessionOnce = async (sessionId: number): Promise<FocusSessionRewards | null> => {
  const active = await getActiveFocusSession();
  let session = active?.id === sessionId ? active : null;
  if (!session || (session.status !== FocusSessionStatus.ACTIVE && session.status !== FocusSessionStatus.PAUSED)) {
    return null;
  }

  if (session.spEarned > 0) {
    return null;
  }

  session = await syncNativeTracking(session);

  clearTimers();
  await FocusMonitorBridge.stopMonitoring();

  const settings = await getOrCreateFocusSettings();
  const durationMinutes = plannedMinutesFromSession(session);
  const rewards = computeFocusRewards({ session, durationMinutes, hardcoreMode: settings.hardcoreMode });

  PlayerService.addXP(rewards.xp);
  PlayerService.addCoins(rewards.coins);
  await StudyPointsService.earn(rewards.studyPoints, 'Focus session', 'focus_mode');
  await PetService.addExperience(Math.max(5, Math.round(rewards.xp * 0.15)));

  if (rewards.lootBoxRarity) {
    await grantLootBoxReward(rewards.lootBoxRarity as LootBoxRarityValue, 'focus_mode');
  }

  if (session.focusedSeconds >= 300) {
    await StudyService.recordStudyDay();
  }

  const endedAt = new Date().toISOString();
  const completed = await updateFocusSession(session.id, {
    status: FocusSessionStatus.COMPLETED,
    endedAt,
    xpEarned: rewards.xp,
    coinsEarned: rewards.coins,
    spEarned: rewards.studyPoints,
    bonusMultiplier: rewards.bonusMultiplier,
    lootBoxGranted: Boolean(rewards.lootBoxRarity),
    lootBoxRarity: rewards.lootBoxRarity,
  });

  await appendFocusSessionEvent({
    sessionId: session.id,
    eventType: FocusSessionEventType.COMPLETED,
    metadataJson: JSON.stringify(rewards),
  });

  const currentAnalytics = await getOrCreateFocusAnalytics();
  const analytics = await recordFocusAnalytics({
    completedSessions: currentAnalytics.completedSessions + 1,
    totalFocusSeconds: currentAnalytics.totalFocusSeconds + session.focusedSeconds,
    totalDistractionSeconds: currentAnalytics.totalDistractionSeconds + session.distractedSeconds,
    totalXpEarned: currentAnalytics.totalXpEarned + rewards.xp,
    totalCoinsEarned: currentAnalytics.totalCoinsEarned + rewards.coins,
    totalSpEarned: currentAnalytics.totalSpEarned + rewards.studyPoints,
    totalLootBoxes: currentAnalytics.totalLootBoxes + (rewards.lootBoxRarity ? 1 : 0),
    lastSessionAt: endedAt,
  });

  useFocusModeStore.setState({ activeSession: null, liveSession: null, lastRewards: rewards, analytics });
  GameEvents.emit({
    type: 'FOCUS_SESSION_COMPLETED',
    sessionId: session.id,
    rewards,
    focusedSeconds: completed?.focusedSeconds ?? session.focusedSeconds,
    distractedSeconds: completed?.distractedSeconds ?? session.distractedSeconds,
  });

  return rewards;
};

export const FocusModeService = {
  async initialize(): Promise<void> {
    try {
      await seedDefaultBlockedApps();
      const [settings, analytics, active] = await Promise.all([
        getOrCreateFocusSettings(),
        getOrCreateFocusAnalytics(),
        getActiveFocusSession(),
      ]);

      useFocusModeStore.setState({ settings, analytics, activeSession: active, isLoading: false });

      if (active) {
        await resumeActiveSession(active, settings.monitoringEnabled);
      }
    } catch (error) {
      AppLogService.error('focus-mode.initialize.failed', 'Failed to initialize Focus Mode store', {
        message: error instanceof Error ? error.message : String(error),
      });

      let settings = FALLBACK_SETTINGS;
      try {
        settings = await getOrCreateFocusSettings();
      } catch {
        // keep fallback
      }

      useFocusModeStore.setState({
        settings,
        analytics: useFocusModeStore.getState().analytics,
        isLoading: false,
      });
    }
  },

  async ensureLiveSession(): Promise<void> {
    const active = useFocusModeStore.getState().activeSession ?? (await getActiveFocusSession());
    if (!active) return;

    if (!useFocusModeStore.getState().liveSession) {
      await syncLiveState(active);
    }
  },

  async refresh(): Promise<void> {
    const [settings, analytics, active] = await Promise.all([
      getOrCreateFocusSettings(),
      getOrCreateFocusAnalytics(),
      getActiveFocusSession(),
    ]);
    useFocusModeStore.setState({ settings, analytics, activeSession: active });
  },

  async updateSettings(patch: Partial<FocusSettings>): Promise<FocusSettings> {
    const current = await getOrCreateFocusSettings();
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await saveFocusSettings(next);
    useFocusModeStore.setState({ settings: next });
    return next;
  },

  async acceptDisclosure(): Promise<void> {
    await FocusModeService.updateSettings({ accessibilityDisclosureAccepted: true });
  },

  async startSession(studyType: FocusStudyTypeValue, durationMinutes: number): Promise<FocusSession | null> {
    const settings = await getOrCreateFocusSettings();
    if (!settings.enabled) return null;

    const existing = await getActiveFocusSession();
    if (existing) return existing;

    blockedPackages = new Set(await getEnabledBlockedPackageNames());
    const session = await createFocusSession({
      studyType,
      plannedDurationSec: durationMinutes * 60,
    });

    await appendFocusSessionEvent({
      sessionId: session.id,
      eventType: FocusSessionEventType.STARTED,
    });

    if (settings.monitoringEnabled) {
      await FocusMonitorBridge.startMonitoring([...blockedPackages]);
      monitorUnsubscribe = FocusMonitorBridge.onForegroundApp((packageName) => {
        void getActiveFocusSession().then((active) => {
          if (active) void handleForegroundPackage(packageName, active);
        });
      });
    }

    appStateSubscription = AppState.addEventListener('change', (state) => {
      void getActiveFocusSession().then((active) => {
        if (active) void handleAppState(state, active);
      });
    });

    trackingState = 'focusing';
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    startTickLoop(session);

    const currentAnalytics = await getOrCreateFocusAnalytics();
    const analytics = await recordFocusAnalytics({
      totalSessions: currentAnalytics.totalSessions + 1,
      lastSessionAt: new Date().toISOString(),
    });

    useFocusModeStore.setState({ activeSession: session, analytics });
    GameEvents.emit({
      type: 'FOCUS_SESSION_STARTED',
      sessionId: session.id,
      studyType,
      plannedDurationSec: session.plannedDurationSec,
    });

    await syncLiveState(session);
    return session;
  },

  async pauseSession(): Promise<void> {
    const session = await getActiveFocusSession();
    if (!session) return;
    trackingState = 'paused';
    await updateFocusSession(session.id, { status: FocusSessionStatus.PAUSED });
    await appendFocusSessionEvent({
      sessionId: session.id,
      eventType: FocusSessionEventType.PAUSED,
    });
  },

  async resumeSession(): Promise<void> {
    const session = await getActiveFocusSession();
    if (!session) return;
    trackingState = 'focusing';
    await updateFocusSession(session.id, { status: FocusSessionStatus.ACTIVE });
    await appendFocusSessionEvent({
      sessionId: session.id,
      eventType: FocusSessionEventType.RESUMED,
    });
  },

  async completeSession(sessionId: number): Promise<FocusSessionRewards | null> {
    if (completingSessionIds.has(sessionId)) {
      return null;
    }

    completingSessionIds.add(sessionId);

    try {
      return await completeFocusSessionOnce(sessionId);
    } finally {
      completingSessionIds.delete(sessionId);
    }
  },

  async abandonSession(reason = 'user'): Promise<void> {
    const session = await getActiveFocusSession();
    if (!session) return;

    const synced = await syncNativeTracking(session);

    clearTimers();
    await FocusMonitorBridge.stopMonitoring();

    const settings = await getOrCreateFocusSettings();
    const durationMinutes = plannedMinutesFromSession(synced);
    const rewards = computeFocusRewards({
      session: synced,
      durationMinutes,
      hardcoreMode: settings.hardcoreMode,
    });

    if (rewards.xp > 0 || rewards.coins > 0 || rewards.studyPoints > 0) {
      PlayerService.addXP(rewards.xp);
      PlayerService.addCoins(rewards.coins);
      await StudyPointsService.earn(rewards.studyPoints, 'Focus session (encerrada cedo)', 'focus_mode');
      await PetService.addExperience(Math.max(1, Math.round(rewards.xp * 0.1)));
    }

    const endedAt = new Date().toISOString();
    await updateFocusSession(synced.id, {
      status: FocusSessionStatus.ABANDONED,
      endedAt,
      abandonReason: reason,
      xpEarned: rewards.xp,
      coinsEarned: rewards.coins,
      spEarned: rewards.studyPoints,
      bonusMultiplier: rewards.bonusMultiplier,
      lootBoxGranted: false,
      lootBoxRarity: null,
    });

    await appendFocusSessionEvent({
      sessionId: synced.id,
      eventType: FocusSessionEventType.ABANDONED,
      metadataJson: JSON.stringify({ reason, rewards }),
    });

    const currentAnalytics = await getOrCreateFocusAnalytics();
    const analytics = await recordFocusAnalytics({
      abandonedSessions: currentAnalytics.abandonedSessions + 1,
      totalFocusSeconds: currentAnalytics.totalFocusSeconds + synced.focusedSeconds,
      totalDistractionSeconds: currentAnalytics.totalDistractionSeconds + synced.distractedSeconds,
      totalXpEarned: currentAnalytics.totalXpEarned + rewards.xp,
      totalCoinsEarned: currentAnalytics.totalCoinsEarned + rewards.coins,
      totalSpEarned: currentAnalytics.totalSpEarned + rewards.studyPoints,
      lastSessionAt: endedAt,
    });

    const hasPartialRewards = rewards.completionRatio > 0 && (rewards.xp > 0 || rewards.studyPoints > 0);

    useFocusModeStore.setState({
      activeSession: null,
      liveSession: null,
      lastRewards: hasPartialRewards ? rewards : null,
      analytics,
    });
    GameEvents.emit({ type: 'FOCUS_SESSION_ABANDONED', sessionId: synced.id, reason });
  },

  getMessages() {
    return FOCUS_MESSAGES;
  },

  clearLastRewards(): void {
    useFocusModeStore.setState({ lastRewards: null });
  },
};
