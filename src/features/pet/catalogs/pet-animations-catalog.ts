import {
  PetAnimationCategory,
  type PetAnimationCategoryValue,
  type PetAnimationDefinition,
} from '@/types/pet-expansion';

const IDLE_ACTIONS = [
  { label: 'Respirando', emoji: '😌' },
  { label: 'Piscando', emoji: '😉' },
  { label: 'Olhando ao redor', emoji: '👀' },
  { label: 'Cochilando', emoji: '😴' },
  { label: 'Bocejando', emoji: '🥱' },
  { label: 'Esticando', emoji: '🙆' },
  { label: 'Observando', emoji: '🔍' },
  { label: 'Pensando', emoji: '🤔' },
];

const HAPPY_ACTIONS = [
  { label: 'Pulando', emoji: '🦘' },
  { label: 'Sorrindo', emoji: '😄' },
  { label: 'Dançando', emoji: '💃' },
  { label: 'Correndo', emoji: '🏃' },
  { label: 'Comemorando', emoji: '🎉' },
  { label: 'Abraçando', emoji: '🤗' },
  { label: 'Brincando', emoji: '🎮' },
  { label: 'Saltitando', emoji: '✨' },
];

const SAD_ACTIONS = [
  { label: 'Cabisbaixo', emoji: '😔' },
  { label: 'Sem energia', emoji: '😞' },
  { label: 'Dormindo demais', emoji: '💤' },
  { label: 'Olhando a janela', emoji: '🪟' },
  { label: 'Suspirando', emoji: '😮‍💨' },
  { label: 'Encolhido', emoji: '🫥' },
];

const EXCITED_ACTIONS = [
  { label: 'Recebendo XP', emoji: '⚡' },
  { label: 'Recebendo comida', emoji: '🍎' },
  { label: 'Evoluindo', emoji: '🌟' },
  { label: 'Ganhou item', emoji: '🎁' },
  { label: 'Level up', emoji: '🚀' },
  { label: 'Streak fire', emoji: '🔥' },
  { label: 'Vitória', emoji: '🏆' },
  { label: 'Surpresa', emoji: '🤩' },
];

const MOOD_MAP: Record<PetAnimationCategoryValue, string> = {
  [PetAnimationCategory.IDLE]: 'normal',
  [PetAnimationCategory.HAPPY]: 'happy',
  [PetAnimationCategory.SAD]: 'sad',
  [PetAnimationCategory.EXCITED]: 'excited',
};

const buildCategory = (
  category: PetAnimationCategoryValue,
  actions: { label: string; emoji: string }[],
  startIndex: number,
  count: number,
): PetAnimationDefinition[] =>
  Array.from({ length: count }, (_, index) => {
    const action = actions[index % actions.length];
    const variant = Math.floor(index / actions.length) + 1;
    const globalIndex = startIndex + index;
    const minAffinity = category === PetAnimationCategory.EXCITED ? 50 : globalIndex > 60 ? 200 : 0;

    return {
      key: `${category}_${action.label.toLowerCase().replace(/\s+/g, '_')}_v${variant}`,
      label: `${action.label}${variant > 1 ? ` ${variant}` : ''}`,
      category,
      mood: MOOD_MAP[category],
      emoji: action.emoji,
      minAffinity,
    };
  });

/** 100+ pet animations across idle, happy, sad, excited. */
export const PET_ANIMATIONS_CATALOG: PetAnimationDefinition[] = [
  ...buildCategory(PetAnimationCategory.IDLE, IDLE_ACTIONS, 0, 28),
  ...buildCategory(PetAnimationCategory.HAPPY, HAPPY_ACTIONS, 28, 28),
  ...buildCategory(PetAnimationCategory.SAD, SAD_ACTIONS, 56, 24),
  ...buildCategory(PetAnimationCategory.EXCITED, EXCITED_ACTIONS, 80, 24),
];

export const PET_ANIMATIONS_BY_KEY = Object.fromEntries(
  PET_ANIMATIONS_CATALOG.map((anim) => [anim.key, anim]),
) as Record<string, PetAnimationDefinition>;

export const DEFAULT_PET_ANIMATION_KEY = PET_ANIMATIONS_CATALOG[0]?.key ?? 'idle_breathing';

export const getAnimationsForMood = (
  moodCategory: PetAnimationCategoryValue,
  affinity: number,
): PetAnimationDefinition[] =>
  PET_ANIMATIONS_CATALOG.filter(
    (anim) => anim.category === moodCategory && anim.minAffinity <= affinity,
  );

export const pickRandomAnimation = (
  moodCategory: PetAnimationCategoryValue,
  affinity: number,
): PetAnimationDefinition => {
  const pool = getAnimationsForMood(moodCategory, affinity);
  if (pool.length === 0) return PET_ANIMATIONS_CATALOG[0];
  return pool[Math.floor(Math.random() * pool.length)];
};
