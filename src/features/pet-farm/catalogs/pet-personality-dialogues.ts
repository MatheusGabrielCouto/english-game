import type { PetDialogueContext, PetDialogueLine } from '@/types/pet-expansion';

import { PET_PERSONALITIES_CATALOG } from './pet-personalities-catalog';

const GREETINGS: Record<string, string> = {
  curious: 'Hmm... what will we learn today? I am curious! 🔍',
  brave: 'You have got this! Let us be brave and study hard today!',
  shy: 'Oh... hi. I am glad you came.',
  playful: 'Tag! You are it — now catch me at the daily quests! 🎮',
  lazy: 'Five more minutes... okay, one small lesson then. 😴',
  smart: 'Did you know "consistency" beats "perfection"? Let us prove it.',
  friendly: 'Hey friend! Best study buddy ever — ready? 💛',
  ambitious: 'Today we climb toward your career goals. Step by step!',
  energetic: 'Let us GO! High energy English session — woo! ⚡',
  calm: 'Breathe in... breathe out... and one calm lesson together.',
  loyal: 'I will always wait for you. Our bond means everything.',
  mischief: 'Psst... I hid your excuses. Time to study! 😏',
  gentle: 'Take your time. I am here, no pressure — okay?',
  proud: 'Look how far we have come. I am proud of us!',
  dreamer: 'One day we will work abroad... start with today\'s lesson.',
  rebel: 'Rules? Nah. But streaks? Those are cool. Let us roll.',
  mentor: 'Remember: small daily practice beats rare marathons.',
  foodie: 'Feed me focus... I mean, let us study before snacks! 🍎',
  athlete: 'Warm-up done — now train your English muscles!',
  artist: 'Every word you learn paints a brighter future. 🎨',
  techie: 'git commit -m "studied English today" — let us ship it!',
  bookworm: 'A chapter a day keeps rust away. Open a quest?',
  social: 'Let us practice speaking — even one sentence counts!',
  guardian: 'I will guard your streak. You guard our progress.',
  romantic: 'You + English + me = a lovely journey. 💕',
  stoic: 'Study. Done. Good.',
  chaotic: 'Maybe XP, maybe loot, maybe both — who knows! 🎲',
  wise: 'A journey of a thousand miles begins with one tap.',
  competitive: 'Leaderboard energy! Beat yesterday\'s you.',
  collector: 'Another species for the dex? Study unlocks everything!',
};

const PRACTICE: Record<string, string> = {
  curious: 'Why do we say "I have been studying" and not "I am studying" for years?',
  brave: 'Say it loud: "I will not give up on my English dream."',
  shy: '"Hello." That is enough. I am proud.',
  playful: 'Repeat: "Learning English is my superpower!"',
  lazy: 'Just one phrase: "I can do it tomorrow" — wait, today!',
  smart: 'Fact: "Remote" teams need clear English. Practice now?',
  friendly: 'Try: "I am happy to practice with my pet friend."',
  ambitious: 'Pitch line: "I bring discipline and growth every day."',
  energetic: 'Shout: "Let\'s go!" — then open a mission!',
  calm: 'Whisper: "Peace begins with one focused minute."',
  loyal: 'Promise: "I will show up for us again tomorrow."',
  mischief: 'Trick question: How do you spell "commitment"? C-O-M-E!',
  gentle: 'Softly: "It is okay to learn slowly."',
  proud: 'Declare: "My English is improving every week."',
  dreamer: 'Imagine saying: "I work with global teams."',
  rebel: 'Slang ok sometimes — but streaks are elite.',
  mentor: 'Lesson: "Feedback is a gift." Accept one today.',
  foodie: 'Menu item: "Today\'s special — vocabulary soup."',
  athlete: 'Coach says: "Reps build fluency. One more quest!"',
  artist: 'Poetry line: "Words color my world."',
  techie: 'Debug: undefined fluency → fix with one drill.',
  bookworm: 'Quote: "Readers are leaders." Open the app.',
  social: 'Dialogue: "Nice to meet you — I practice daily."',
  guardian: 'Oath: "I protect my streak like a shield."',
  romantic: 'Sweet line: "You make learning feel warm."',
  stoic: 'Phrase: "Done is better than perfect."',
  chaotic: 'Random: "Supercalifragilistic... or just hello!"',
  wise: 'Proverb: "Practice makes progress."',
  competitive: 'Battle cry: "Victory is a habit!"',
  collector: 'Dex entry: "Player studied — rarity: epic."',
};

const buildPersonalityDialogues = (): PetDialogueLine[] => {
  const lines: PetDialogueLine[] = [];
  for (const personality of PET_PERSONALITIES_CATALOG) {
    const greeting = GREETINGS[personality.key];
    const practice = PRACTICE[personality.key];
    if (greeting) {
      lines.push({
        key: `personality_${personality.key}_greeting`,
        context: 'greeting',
        text: greeting,
        minAffinity: 0,
        personalityKeys: [personality.key],
      });
    }
    if (practice) {
      lines.push({
        key: `personality_${personality.key}_practice`,
        context: 'english_practice',
        text: practice,
        minAffinity: 0,
        personalityKeys: [personality.key],
      });
    }
  }
  return lines;
};

export const PET_PERSONALITY_DIALOGUES = buildPersonalityDialogues();
