import { LearningSkillKey, type LearningWeeklyDayPlan } from '@/types/learning-gps'

export const DEFAULT_WEEKLY_PLAN_DAYS: Omit<LearningWeeklyDayPlan, 'isToday'>[] = [
  {
    weekday: 1,
    label: 'Segunda',
    focusSkills: [LearningSkillKey.VOCABULARY, LearningSkillKey.READING],
    isProjectDay: false,
    isReviewDay: false,
    isSpeakingDay: false,
  },
  {
    weekday: 2,
    label: 'Terça',
    focusSkills: [LearningSkillKey.VOCABULARY, LearningSkillKey.LISTENING],
    isProjectDay: false,
    isReviewDay: false,
    isSpeakingDay: false,
  },
  {
    weekday: 3,
    label: 'Quarta',
    focusSkills: [LearningSkillKey.SPEAKING],
    isProjectDay: false,
    isReviewDay: false,
    isSpeakingDay: true,
  },
  {
    weekday: 4,
    label: 'Quinta',
    focusSkills: [LearningSkillKey.GRAMMAR, LearningSkillKey.READING],
    isProjectDay: false,
    isReviewDay: false,
    isSpeakingDay: false,
  },
  {
    weekday: 5,
    label: 'Sexta',
    focusSkills: [LearningSkillKey.LISTENING, LearningSkillKey.VOCABULARY],
    isProjectDay: false,
    isReviewDay: false,
    isSpeakingDay: false,
  },
  {
    weekday: 6,
    label: 'Sábado',
    focusSkills: [],
    isProjectDay: true,
    isReviewDay: false,
    isSpeakingDay: false,
  },
  {
    weekday: 0,
    label: 'Domingo',
    focusSkills: [],
    isProjectDay: false,
    isReviewDay: true,
    isSpeakingDay: false,
  },
]

export const WEEKLY_PROJECTS = [
  {
    title: 'Escrever um texto em inglês',
    description: 'Registre um parágrafo no English Journal sobre seu dia ou um tema técnico.',
    emoji: '✍️',
  },
  {
    title: 'Gravar áudio em inglês',
    description: 'Pratique speaking gravando 1–2 minutos no Farm ou no Journal.',
    emoji: '🎤',
  },
  {
    title: 'Resumir um vídeo',
    description: 'Assista a um vídeo curto em inglês e escreva 3 frases de resumo.',
    emoji: '🎬',
  },
  {
    title: 'Explicar um código',
    description: 'Descreva em inglês uma função ou feature que você implementou.',
    emoji: '💻',
  },
] as const
