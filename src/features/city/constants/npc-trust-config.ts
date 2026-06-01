import type { NpcTrustBand } from '@/types/city-npc-trust';
import { NPC_TRUST_DEFAULT, NPC_TRUST_MAX, NPC_TRUST_MIN } from '@/types/city-npc-trust';

export const NPC_TRUST_DELTA = {
  localMissionClaimed: 3,
  contractCompleted: 8,
  contractFailed: -12,
  chainStepClaimed: 5,
  chainComplete: 10,
} as const;

export const clampNpcTrust = (value: number): number =>
  Math.max(NPC_TRUST_MIN, Math.min(NPC_TRUST_MAX, Math.round(value)));

export const getNpcTrustBand = (trust: number): NpcTrustBand => {
  if (trust >= 70) return 'ally';
  if (trust >= 40) return 'friendly';
  if (trust >= 25) return 'neutral';
  return 'wary';
};

export const getNpcTrustLabel = (band: NpcTrustBand): string => {
  switch (band) {
    case 'ally':
      return 'Aliado';
    case 'friendly':
      return 'Amigável';
    case 'neutral':
      return 'Neutro';
    case 'wary':
      return 'Cauteloso';
  }
};

export const normalizeNpcTrust = (trust: number | undefined): number =>
  clampNpcTrust(trust ?? NPC_TRUST_DEFAULT);
