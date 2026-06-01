import { useEffect, useState } from 'react';

import { getManualFarmCooldownRemainingMs } from '@/features/farm/services/farm-service';
import { useFarmStore } from '@/features/farm/store/farm-store';

export const useFarmCooldown = () => {
  const cooldownEndsAt = useFarmStore((state) => state.manualCooldownEndsAt);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const update = () => setRemainingMs(getManualFarmCooldownRemainingMs());
    update();

    if (!cooldownEndsAt) return;

    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  const remainingSec = Math.ceil(remainingMs / 1000);

  return {
    isOnCooldown: remainingMs > 0,
    remainingMs,
    remainingSec,
  };
};
