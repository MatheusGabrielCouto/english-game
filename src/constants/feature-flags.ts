/**
 * Feature flags for learning systems (M0+).
 * Keep disabled until the corresponding milestone ships UI.
 */
export const featureFlags = {
  /** M1: Baralho Vivo hub + revisão MVP */
  flashDeckEnabled: true,
  duelsEnabled: true,
  /** Fase 28: Mentor IA — Professor Atlas */
  mentorAiEnabled: true,
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;

export const isFlashDeckEnabled = (): boolean => featureFlags.flashDeckEnabled;

export const isDuelsEnabled = (): boolean => featureFlags.duelsEnabled;

/** Guard for Expo Router screens — returns false when feature is off */
export const canAccessFlashDeck = (): boolean => isFlashDeckEnabled();

export const canAccessDuels = (): boolean => isDuelsEnabled();

export const isMentorAiEnabled = (): boolean => featureFlags.mentorAiEnabled;

export const canAccessMentorAi = (): boolean => isMentorAiEnabled();
