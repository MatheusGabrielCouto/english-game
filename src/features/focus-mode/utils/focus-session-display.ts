import type { FocusSession } from '@/types/focus-mode';

/** Tempo de foco exibido na UI — acompanha o relógio da sessão mesmo se o tick do DB atrasar. */
export const getDisplayFocusedSeconds = (session: FocusSession, elapsedSec: number): number => {
  const fromWall = Math.max(
    0,
    elapsedSec - session.distractedSeconds - session.idleSeconds - session.pauseSeconds,
  );
  return Math.max(session.focusedSeconds, fromWall);
};
