import type { CollectionCategoryDetail, CollectionCategoryKey } from '@/types/metagame';

type CollectionMeta = {
  label: string;
  emoji: string;
  description: string;
  tone: CollectionCategoryDetail['tone'];
  hint: string;
};

export const COLLECTION_META: Record<CollectionCategoryKey, CollectionMeta> = {
  pets: {
    label: 'Pets',
    emoji: '🐾',
    description: 'Companheiros descobertos na sua jornada.',
    tone: 'primary',
    hint: 'Choque ovos e evolua pets para completar o álbum.',
  },
  items: {
    label: 'Itens',
    emoji: '🎒',
    description: 'Consumíveis, boosters e chaves coletados.',
    tone: 'accent',
    hint: 'Abra loot boxes, complete contratos e visite a loja.',
  },
  titles: {
    label: 'Títulos',
    emoji: '👑',
    description: 'Títulos profissionais desbloqueados.',
    tone: 'gold',
    hint: 'Suba de nível e avance na carreira internacional.',
  },
  achievements: {
    label: 'Conquistas',
    emoji: '🏆',
    description: 'Marcos permanentes da sua dedicação.',
    tone: 'success',
    hint: 'Mantenha streaks, missões e XP em alta.',
  },
  relics: {
    label: 'Relíquias',
    emoji: '💎',
    description: 'Artefatos raros com bônus permanentes.',
    tone: 'warning',
    hint: 'Encontre relíquias em temporadas e loot épica.',
  },
};

export const LEGACY_CATEGORY_EMOJI: Record<string, string> = {
  origin: '🌱',
  streak: '🔥',
  pet: '🐾',
  contract: '📋',
  career: '💼',
  achievement: '🏆',
};
