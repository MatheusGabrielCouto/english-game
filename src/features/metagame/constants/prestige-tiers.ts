import type { PrestigeTier } from '@/types/metagame';

import { PRESTIGE_CATALOG } from '@/features/prestige/constants/prestige-catalog';

export const PRESTIGE_TIERS: PrestigeTier[] = PRESTIGE_CATALOG.map((tier) => ({
  level: tier.level,
  name: tier.name,
  requiredLevel: tier.requiredPlayerLevel,
  rewardLabel: tier.rewards.join(' · '),
}));
