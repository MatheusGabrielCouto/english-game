import type { FocusSession } from '@/types/focus-mode';

export const getSessionStartedAtMs = (session: FocusSession): number =>
  new Date(session.startedAt).getTime();

export const getSessionEndsAtMs = (session: FocusSession): number =>
  getSessionStartedAtMs(session) + session.plannedDurationSec * 1000;

export const getWallRemainingSec = (session: FocusSession, nowMs = Date.now()): number => {
  const remainingMs = getSessionEndsAtMs(session) - nowMs;
  return Math.max(0, Math.ceil(remainingMs / 1000));
};

export const getWallElapsedSec = (session: FocusSession, nowMs = Date.now()): number => {
  const elapsedMs = nowMs - getSessionStartedAtMs(session);
  return Math.min(session.plannedDurationSec, Math.max(0, Math.floor(elapsedMs / 1000)));
};

export const isFocusSessionExpired = (session: FocusSession, nowMs = Date.now()): boolean =>
  getWallRemainingSec(session, nowMs) <= 0;
