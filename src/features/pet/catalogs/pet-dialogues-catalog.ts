import { PET_PERSONALITY_DIALOGUES } from '@/features/pet-farm/catalogs/pet-personality-dialogues';
import type { PetDialogueContext, PetDialogueLine } from '@/types/pet-expansion';

const lines = (
  context: PetDialogueContext,
  texts: string[],
  minAffinity = 0,
): PetDialogueLine[] =>
  texts.map((text, index) => ({
    key: `${context}_${index + 1}`,
    context,
    text,
    minAffinity,
  }));

export const PET_DIALOGUES_CATALOG: PetDialogueLine[] = [
  ...lines('greeting', [
    "Hey! Ready to study today? Let's go! 📚",
    'Good to see you! I missed our study sessions.',
    "Hi friend! What's our mission today?",
    'Welcome back! Your English journey continues!',
  ]),
  ...lines('streak', [
    "Wow, your streak is on fire! 🔥 Don't break it!",
    'Consistency is key — and you are crushing it!',
    'Every day counts. Keep showing up!',
  ], 50),
  ...lines('xp', [
    'You earned XP! We are getting stronger together!',
    'Level up energy! I can feel us evolving!',
    'Great job! That XP brings us closer to our goals.',
  ]),
  ...lines('mood_happy', [
    "I'm so happy today! Let's learn something new!",
    'Best day ever! Study with me?',
    'Your progress makes me dance! 💃',
  ]),
  ...lines('mood_sad', [
    "I feel a bit lonely... Let's study together?",
    'Missing you... open the app and say hi!',
    'A short lesson would cheer me up!',
  ]),
  ...lines('mission', [
    'Daily missions await! Let us complete them!',
    'Quest time! Which mission first?',
    'Finish your dailies and I will celebrate!',
  ], 30),
  ...lines('evolution', [
    'I evolved! Thank you for believing in us!',
    'New stage unlocked! Our bond grows stronger!',
    'Look at me now! We did this together!',
  ], 100),
  ...lines('affinity', [
    'You are my best study partner ever!',
    'Our affinity is legendary. I trust you completely.',
    'Best friends study English together! 🌍',
  ], 300),
  ...lines('routine', [
    'Good morning! Perfect time for vocabulary!',
    'Afternoon study session? I am ready!',
    'Evening review keeps the streak alive!',
    'Shhh... I am resting. See you tomorrow!',
  ]),
  ...lines('english_practice', [
    'Try saying: "I am improving my English every day."',
    'Repeat after me: "Consistency beats perfection."',
    'Practice question: What did you learn today?',
    'Let us practice: "Remote work changed my career."',
  ], 150),
  ...PET_PERSONALITY_DIALOGUES,
];

const matchesPersonality = (line: PetDialogueLine, personalityKey: string | null | undefined): boolean => {
  if (!line.personalityKeys?.length) return true;
  if (!personalityKey) return false;
  return line.personalityKeys.includes(personalityKey);
};

export const pickDialogue = (
  context: PetDialogueContext,
  affinity: number,
  personalityKey?: string | null,
): PetDialogueLine => {
  const personalityPool = PET_DIALOGUES_CATALOG.filter(
    (line) =>
      line.context === context &&
      line.minAffinity <= affinity &&
      matchesPersonality(line, personalityKey) &&
      line.personalityKeys?.length,
  );
  if (personalityPool.length > 0) {
    return personalityPool[Math.floor(Math.random() * personalityPool.length)];
  }

  const universalPool = PET_DIALOGUES_CATALOG.filter(
    (line) =>
      line.context === context &&
      line.minAffinity <= affinity &&
      !line.personalityKeys?.length,
  );
  const pool = universalPool.length > 0 ? universalPool : PET_DIALOGUES_CATALOG;
  return pool[Math.floor(Math.random() * pool.length)] ?? PET_DIALOGUES_CATALOG[0];
};

export const PET_MEMORY_DEFINITIONS = [
  { key: 'first_day', title: 'Primeiro Dia', description: 'Você conheceu seu companheiro.', icon: '🌱', eventType: 'PET_CREATED' },
  { key: 'first_streak_7', title: 'Streak de 7', description: 'Uma semana juntos!', icon: '🔥', eventType: 'STREAK_7' },
  { key: 'first_evolution', title: 'Primeira Evolução', description: 'Seu pet evoluiu pela primeira vez.', icon: '🐣', eventType: 'PET_STAGE_EVOLVED' },
  { key: 'first_contract', title: 'Primeiro Contrato', description: 'Compromisso compartilhado.', icon: '📜', eventType: 'CONTRACT_COMPLETED' },
  { key: 'level_50', title: 'Nível 50', description: 'Meio caminho andado juntos.', icon: '⭐', eventType: 'PLAYER_LEVEL_50' },
  { key: 'affinity_500', title: 'Melhores Amigos', description: 'Afinidade 500+ alcançada.', icon: '💛', eventType: 'AFFINITY_500' },
  { key: 'affinity_1000', title: 'Alma Gêmea', description: 'Afinidade máxima!', icon: '💖', eventType: 'AFFINITY_1000' },
  { key: 'legendary_stage', title: 'Estágio Lendário', description: 'Seu pet alcançou o ápice.', icon: '🦅', eventType: 'LEGENDARY_STAGE' },
];
