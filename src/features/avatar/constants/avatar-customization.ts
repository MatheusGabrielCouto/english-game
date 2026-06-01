export type AvatarFrameKey = 'default' | 'bronze' | 'silver' | 'gold' | 'neon' | 'legendary';

export type AvatarBadgeKey = 'none' | 'scholar' | 'streak' | 'champion' | 'legend';

export const AVATAR_FRAMES: Record<
  AvatarFrameKey,
  { label: string; borderColor: string; glowColor: string; unlockLevel: number }
> = {
  default: { label: 'Padrão', borderColor: '#8b5cf6', glowColor: '#a78bfa', unlockLevel: 1 },
  bronze: { label: 'Bronze', borderColor: '#cd7f32', glowColor: '#d97706', unlockLevel: 5 },
  silver: { label: 'Prata', borderColor: '#c0c0c0', glowColor: '#94a3b8', unlockLevel: 15 },
  gold: { label: 'Ouro', borderColor: '#fbbf24', glowColor: '#f59e0b', unlockLevel: 30 },
  neon: { label: 'Neon', borderColor: '#38bdf8', glowColor: '#22d3ee', unlockLevel: 50 },
  legendary: { label: 'Lendário', borderColor: '#f472b6', glowColor: '#ec4899', unlockLevel: 75 },
};

export const AVATAR_BADGES: Record<
  AvatarBadgeKey,
  { label: string; emoji: string; unlockLevel: number }
> = {
  none: { label: 'Nenhum', emoji: '', unlockLevel: 0 },
  scholar: { label: 'Estudioso', emoji: '📚', unlockLevel: 10 },
  streak: { label: 'Consistente', emoji: '🔥', unlockLevel: 20 },
  champion: { label: 'Campeão', emoji: '🏆', unlockLevel: 40 },
  legend: { label: 'Lenda', emoji: '👑', unlockLevel: 60 },
};
