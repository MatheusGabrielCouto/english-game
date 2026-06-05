import type { PetStatKeyValue } from '@/types/pet-instance';

export const PetAcademyTrack = {
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  CAREER: 'career',
} as const;

export type PetAcademyTrackKey = (typeof PetAcademyTrack)[keyof typeof PetAcademyTrack];

export type PetAcademyEntry = {
  id: number;
  instanceId: number;
  trackKey: PetAcademyTrackKey;
  startedAt: string;
  endsAt: string;
  createdAt: string;
};

export type PetAcademyClaimResult = {
  sessionId: number;
  instanceId: number;
  trackKey: PetAcademyTrackKey;
  petXp: number;
  statKey: PetStatKeyValue;
  statGain: number;
  traitGranted: string | null;
  flavor: string;
};
