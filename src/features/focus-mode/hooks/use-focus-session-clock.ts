import { useEffect, useState } from 'react';

import type { FocusSession } from '@/types/focus-mode';

import { getWallElapsedSec, getWallRemainingSec } from '../utils/focus-session-clock';

type UseFocusSessionClockOptions = {
  onEnded?: () => void;
};

export const useFocusSessionClock = (
  session: FocusSession,
  { onEnded }: UseFocusSessionClockOptions = {},
) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(intervalId);
  }, []);

  const remainingSec = getWallRemainingSec(session, nowMs);
  const elapsedSec = getWallElapsedSec(session, nowMs);

  useEffect(() => {
    if (remainingSec > 0 || !onEnded) return;
    onEnded();
  }, [remainingSec, onEnded]);

  return { remainingSec, elapsedSec };
};
