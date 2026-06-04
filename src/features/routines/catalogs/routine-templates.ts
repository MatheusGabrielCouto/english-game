import {
    RoutineCategory,
    RoutineFrequency,
    type RoutineCategoryValue,
    type RoutineFrequencyValue,
} from '@/types/routine';

export type RoutineTemplate = {
  key: string;
  name: string;
  description: string;
  emoji: string;
  category: RoutineCategoryValue;
  frequency: RoutineFrequencyValue;
  weekdays: number[];
  expectedDurationMin: number;
  defaultXp: number;
  defaultCoins: number;
};

/** 0=domingo … 6=sábado (Date.getUTCDay) */
export const ROUTINE_WEEKDAY_LABELS = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
] as const;

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    key: 'english_course',
    name: 'Curso de Inglês',
    description: 'Aula ou módulo do seu curso principal.',
    emoji: '🎓',
    category: RoutineCategory.ENGLISH_COURSE,
    frequency: RoutineFrequency.DAILY,
    weekdays: [1, 2, 3, 4, 5],
    expectedDurationMin: 60,
    defaultXp: 30,
    defaultCoins: 15,
  },
  {
    key: 'conversation',
    name: 'Conversação',
    description: 'Aula de conversação ou speaking com professor/grupo.',
    emoji: '🗣️',
    category: RoutineCategory.SPEAKING,
    frequency: RoutineFrequency.WEEKLY,
    weekdays: [2, 4],
    expectedDurationMin: 45,
    defaultXp: 40,
    defaultCoins: 20,
  },
  {
    key: 'vocabulary',
    name: 'Vocabulário',
    description: 'Anki, flashcards ou lista de palavras.',
    emoji: '📝',
    category: RoutineCategory.VOCABULARY,
    frequency: RoutineFrequency.DAILY,
    weekdays: [],
    expectedDurationMin: 20,
    defaultXp: 18,
    defaultCoins: 10,
  },
  {
    key: 'reading',
    name: 'Reading',
    description: 'Livro, artigo ou texto em inglês.',
    emoji: '📖',
    category: RoutineCategory.READING,
    frequency: RoutineFrequency.DAILY,
    weekdays: [],
    expectedDurationMin: 30,
    defaultXp: 22,
    defaultCoins: 12,
  },
  {
    key: 'speaking_practice',
    name: 'Speaking',
    description: 'Prática de pronúncia ou shadowing.',
    emoji: '🎤',
    category: RoutineCategory.SPEAKING,
    frequency: RoutineFrequency.DAILY,
    weekdays: [],
    expectedDurationMin: 15,
    defaultXp: 25,
    defaultCoins: 14,
  },
  {
    key: 'review',
    name: 'Revisão',
    description: 'Revisar conteúdo da semana.',
    emoji: '🔄',
    category: RoutineCategory.GRAMMAR,
    frequency: RoutineFrequency.WEEKLY,
    weekdays: [0],
    expectedDurationMin: 40,
    defaultXp: 28,
    defaultCoins: 14,
  },
  {
    key: 'interview_prep',
    name: 'Entrevista em Inglês',
    description: 'Simulado ou preparação para entrevistas.',
    emoji: '💼',
    category: RoutineCategory.CAREER,
    frequency: RoutineFrequency.WEEKLY,
    weekdays: [6],
    expectedDurationMin: 50,
    defaultXp: 35,
    defaultCoins: 18,
  },
  {
    key: 'programming_english',
    name: 'Programação em Inglês',
    description: 'Documentação, vídeos ou código em inglês.',
    emoji: '💻',
    category: RoutineCategory.PROGRAMMING_ENGLISH,
    frequency: RoutineFrequency.DAILY,
    weekdays: [1, 2, 3, 4, 5],
    expectedDurationMin: 45,
    defaultXp: 24,
    defaultCoins: 12,
  },
];

export const ROUTINE_TEMPLATE_BY_KEY = Object.fromEntries(
  ROUTINE_TEMPLATES.map((t) => [t.key, t]),
) as Record<string, RoutineTemplate>;
