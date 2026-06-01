export const FocusStudyType = {
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  PROGRAMMING: 'programming',
} as const;

export type FocusStudyTypeValue = (typeof FocusStudyType)[keyof typeof FocusStudyType];

export const FocusSessionStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export type FocusSessionStatusValue = (typeof FocusSessionStatus)[keyof typeof FocusSessionStatus];

export const FocusSessionEventType = {
  STARTED: 'started',
  PAUSED: 'paused',
  RESUMED: 'resumed',
  DISTRACTION_START: 'distraction_start',
  DISTRACTION_END: 'distraction_end',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  REWARD_GRANTED: 'reward_granted',
} as const;

export type FocusSessionEventTypeValue =
  (typeof FocusSessionEventType)[keyof typeof FocusSessionEventType];

export const FocusBlockedAppCategory = {
  SOCIAL: 'social',
  VIDEO: 'video',
  GAME: 'game',
  BROWSER: 'browser',
  OTHER: 'other',
} as const;

export type FocusBlockedAppCategoryValue =
  (typeof FocusBlockedAppCategory)[keyof typeof FocusBlockedAppCategory];

export type FocusSettings = {
  enabled: boolean;
  defaultDurationMinutes: number;
  hardcoreMode: boolean;
  monitoringEnabled: boolean;
  accessibilityDisclosureAccepted: boolean;
  updatedAt: string;
};

export type FocusBlockedApp = {
  packageName: string;
  label: string;
  category: FocusBlockedAppCategoryValue;
  enabled: boolean;
  isDefault: boolean;
};

export type FocusSession = {
  id: number;
  studyType: FocusStudyTypeValue;
  plannedDurationSec: number;
  status: FocusSessionStatusValue;
  startedAt: string;
  endedAt: string | null;
  focusedSeconds: number;
  distractedSeconds: number;
  idleSeconds: number;
  pauseSeconds: number;
  wordsLearned: number;
  xpEarned: number;
  coinsEarned: number;
  spEarned: number;
  bonusMultiplier: number;
  lootBoxGranted: boolean;
  lootBoxRarity: string | null;
  abandonReason: string | null;
};

export type FocusSessionEvent = {
  id: number;
  sessionId: number;
  eventType: FocusSessionEventTypeValue;
  packageName: string | null;
  durationSec: number | null;
  occurredAt: string;
  metadataJson: string | null;
};

export type FocusAnalytics = {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalFocusSeconds: number;
  totalDistractionSeconds: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  totalSpEarned: number;
  totalLootBoxes: number;
  lastSessionAt: string | null;
};

export type FocusSessionRewards = {
  xp: number;
  coins: number;
  studyPoints: number;
  bonusMultiplier: number;
  lootBoxRarity: string | null;
  petAffinityGain: number;
  focusRatio: number;
  /** 0–1: tempo cumprido em relação ao planejado (1 = sessão completa). */
  completionRatio: number;
};

export type FocusLiveSessionState = {
  session: FocusSession;
  elapsedSec: number;
  remainingSec: number;
  trackingState: 'focusing' | 'distracted' | 'idle' | 'paused';
  currentDistractionPackage: string | null;
  distractionMessage: string | null;
};

export const FocusAccessibilityStatus = {
  UNSUPPORTED: 'unsupported',
  DISABLED: 'disabled',
  ENABLED: 'enabled',
} as const;

export type FocusAccessibilityStatusValue =
  (typeof FocusAccessibilityStatus)[keyof typeof FocusAccessibilityStatus];
