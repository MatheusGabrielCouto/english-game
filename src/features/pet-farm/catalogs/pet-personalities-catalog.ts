import {
  PetAnimationCategory,
  type PetAnimationCategoryValue,
} from '@/types/pet-expansion';

export type PetPersonalityKey =
  | 'curious'
  | 'brave'
  | 'shy'
  | 'playful'
  | 'lazy'
  | 'smart'
  | 'friendly'
  | 'ambitious'
  | 'energetic'
  | 'calm'
  | 'loyal'
  | 'mischief'
  | 'gentle'
  | 'proud'
  | 'dreamer'
  | 'rebel'
  | 'mentor'
  | 'foodie'
  | 'athlete'
  | 'artist'
  | 'techie'
  | 'bookworm'
  | 'social'
  | 'guardian'
  | 'romantic'
  | 'stoic'
  | 'chaotic'
  | 'wise'
  | 'competitive'
  | 'collector';

export type PetPersonalityDefinition = {
  key: PetPersonalityKey;
  name: string;
  tone: string;
  preferredCategory: PetAnimationCategoryValue;
  /** Substrings matched against animation keys for preferred reactions. */
  animationHints: string[];
};

const p = (
  key: PetPersonalityKey,
  name: string,
  tone: string,
  preferredCategory: PetAnimationCategoryValue,
  animationHints: string[],
): PetPersonalityDefinition => ({
  key,
  name,
  tone,
  preferredCategory,
  animationHints,
});

export const PET_PERSONALITIES_CATALOG: PetPersonalityDefinition[] = [
  p('curious', 'Curious', 'perguntas', PetAnimationCategory.IDLE, ['pensando', 'observando']),
  p('brave', 'Brave', 'motivacional', PetAnimationCategory.EXCITED, ['vitoria', 'recebendo_xp']),
  p('shy', 'Shy', 'curto', PetAnimationCategory.SAD, ['cabisbaixo', 'encolhido']),
  p('playful', 'Playful', 'brincalhão', PetAnimationCategory.HAPPY, ['pulando', 'brincando']),
  p('lazy', 'Lazy', 'preguiçoso', PetAnimationCategory.IDLE, ['cochilando', 'bocejando']),
  p('smart', 'Smart', 'facts inglês', PetAnimationCategory.IDLE, ['pensando']),
  p('friendly', 'Friendly', 'caloroso', PetAnimationCategory.HAPPY, ['sorrindo', 'abracando']),
  p('ambitious', 'Ambitious', 'metas carreira', PetAnimationCategory.EXCITED, ['level_up', 'streak']),
  p('energetic', 'Energetic', 'alta energia', PetAnimationCategory.HAPPY, ['correndo', 'saltitando']),
  p('calm', 'Calm', 'zen', PetAnimationCategory.IDLE, ['respirando', 'esticando']),
  p('loyal', 'Loyal', 'apego', PetAnimationCategory.HAPPY, ['abracando', 'sorrindo']),
  p('mischief', 'Mischief', 'humor', PetAnimationCategory.HAPPY, ['piscando', 'surpresa']),
  p('gentle', 'Gentle', 'cuidado', PetAnimationCategory.IDLE, ['respirando', 'observando']),
  p('proud', 'Proud', 'confiante', PetAnimationCategory.EXCITED, ['vitoria', 'evoluindo']),
  p('dreamer', 'Dreamer', 'aspirações', PetAnimationCategory.IDLE, ['observando', 'pensando']),
  p('rebel', 'Rebel', 'informal', PetAnimationCategory.HAPPY, ['dancando', 'brincando']),
  p('mentor', 'Mentor', 'ensina', PetAnimationCategory.IDLE, ['pensando', 'observando']),
  p('foodie', 'Foodie', 'fome', PetAnimationCategory.EXCITED, ['recebendo', 'comida']),
  p('athlete', 'Athlete', 'exercício', PetAnimationCategory.HAPPY, ['correndo', 'esticando']),
  p('artist', 'Artist', 'criativo', PetAnimationCategory.HAPPY, ['dancando', 'saltitando']),
  p('techie', 'Techie', 'dev jokes', PetAnimationCategory.EXCITED, ['recebendo_xp', 'surpresa']),
  p('bookworm', 'Bookworm', 'leitura', PetAnimationCategory.IDLE, ['pensando', 'cochilando']),
  p('social', 'Social', 'speaking', PetAnimationCategory.HAPPY, ['sorrindo', 'abracando']),
  p('guardian', 'Guardian', 'proteção', PetAnimationCategory.EXCITED, ['vitoria', 'streak']),
  p('romantic', 'Romantic', 'emojis suaves', PetAnimationCategory.HAPPY, ['abracando', 'sorrindo']),
  p('stoic', 'Stoic', 'minimal', PetAnimationCategory.IDLE, ['respirando', 'observando']),
  p('chaotic', 'Chaotic', 'imprevisível', PetAnimationCategory.EXCITED, ['surpresa', 'dancando']),
  p('wise', 'Wise', 'provérbios', PetAnimationCategory.IDLE, ['pensando', 'observando']),
  p('competitive', 'Competitive', 'liga', PetAnimationCategory.EXCITED, ['vitoria', 'streak']),
  p('collector', 'Collector', 'dex', PetAnimationCategory.HAPPY, ['comemorando', 'ganhou']),
];

export const PET_PERSONALITY_KEYS = PET_PERSONALITIES_CATALOG.map((entry) => entry.key);

export const PET_PERSONALITIES_BY_KEY = Object.fromEntries(
  PET_PERSONALITIES_CATALOG.map((entry) => [entry.key, entry]),
) as Record<PetPersonalityKey, PetPersonalityDefinition>;

export const DEFAULT_PERSONALITY_KEY: PetPersonalityKey = 'friendly';

export const getPersonalityDefinition = (
  key: string | null | undefined,
): PetPersonalityDefinition =>
  PET_PERSONALITIES_BY_KEY[key as PetPersonalityKey] ??
  PET_PERSONALITIES_BY_KEY[DEFAULT_PERSONALITY_KEY];
