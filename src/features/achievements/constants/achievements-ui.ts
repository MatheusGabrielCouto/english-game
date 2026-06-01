import { AchievementCategory, type AchievementCategoryValue } from '@/types/achievement';

export const ACHIEVEMENTS_UI = {
  heroTitle: 'Hall da fama',
  heroSubtitle: 'Marcos permanentes da sua jornada de estudo',
  unlockedLabel: 'desbloqueadas',
  howItWorks: [
    'Conquistas não expiram — progresso salvo para sempre.',
    'Cada badge pode dar moedas, escudos ou loot ao desbloquear.',
    'Continue estudando: novas metas aparecem conforme você evolui.',
  ],
} as const;

export const CATEGORY_META: Record<
  AchievementCategoryValue,
  { title: string; emoji: string; subtitle: string }
> = {
  [AchievementCategory.STREAK]: {
    title: 'Streak',
    emoji: '🔥',
    subtitle: 'Dias consecutivos e consistência',
  },
  [AchievementCategory.MISSIONS]: {
    title: 'Missões',
    emoji: '⚔️',
    subtitle: 'Missões diárias e semanais',
  },
  [AchievementCategory.XP]: {
    title: 'XP',
    emoji: '⚡',
    subtitle: 'Experiência acumulada',
  },
  [AchievementCategory.LEVEL]: {
    title: 'Nível',
    emoji: '⭐',
    subtitle: 'Evolução do personagem',
  },
  [AchievementCategory.PET]: {
    title: 'Pet',
    emoji: '🐾',
    subtitle: 'Companheiro e estágios',
  },
  [AchievementCategory.LOOT_BOXES]: {
    title: 'Loot',
    emoji: '🎁',
    subtitle: 'Caixas abertas',
  },
};
