import type { LearningSkillKeyValue } from '@/types/learning-gps'

export const MentorAIMode = {
  PROFESSOR: 'professor',
  COACH: 'coach',
  EVALUATOR: 'evaluator',
} as const

export type MentorAIModeValue = (typeof MentorAIMode)[keyof typeof MentorAIMode]

export const MentorMemoryKeyPrefix = {
  GOAL: 'goal_',
  PREFERENCE: 'pref_',
  TOPIC: 'topic_',
} as const

export type MentorChatMessageRole = 'user' | 'assistant' | 'system'

export type MentorChatMessage = {
  id: string
  role: MentorChatMessageRole
  content: string
  createdAt: string
}

export type MentorChatSessionRecord = {
  id: string
  mode: MentorAIModeValue
  title: string
  messages: MentorChatMessage[]
  createdAt: string
  updatedAt: string
}

export type MentorErrorLogRecord = {
  id: string
  category: string
  original: string
  corrected: string
  occurredAt: string
}

export const MentorCorrectionCategory = {
  GRAMMAR_TENSE: 'grammar_tense',
  GRAMMAR_AGREEMENT: 'grammar_agreement',
  VOCABULARY: 'vocabulary',
  PREPOSITION: 'preposition',
  ARTICLE: 'article',
  WORD_ORDER: 'word_order',
  COLLOCATION: 'collocation',
  OTHER: 'other',
} as const

export type MentorCorrectionCategoryValue =
  (typeof MentorCorrectionCategory)[keyof typeof MentorCorrectionCategory]

export type CorrectionResult = {
  original: string
  corrected: string
  explanation: string
  explanationEn?: string
  category: MentorCorrectionCategoryValue
  practiceTip?: string
  raw?: string
}

export type MentorCorrectionState = {
  input: string
  result: CorrectionResult | null
  isGenerating: boolean
  streamingText: string
  error: string | null
  savedErrorId: string | null
}

export type MentorAIContext = {
  generatedAt: string
  player: {
    level: number
    streak: number
    coins: number
    studyPoints: number
  }
  skills: {
    vocabulary: number
    reading: number
    listening: number
    speaking: number
    writing: number
    grammar: number
    weakest: LearningSkillKeyValue
    strongest: LearningSkillKeyValue
  }
  learningGps: {
    currentWorld: string
    worldCefr: string
    worldProgress: number
    activeUnitTitle: string | null
    curriculumCompleted: number
    curriculumTotal: number
    prioritySkills: string[]
    weeklyFocus: string | null
    path: MentorGpsPathSnapshot
  }
  farm: MentorFarmBridgeSnapshot
  motivation: MentorMotivationBridgeSnapshot
  activity: {
    duelWinRate: number
    flashReviewsToday: number
    farmMinutesToday: number
    routinesDueToday: number
    routinesCompletedToday: number
  }
  career: {
    englishScore: number | null
    activeContract: string | null
  }
  memory: {
    goals: string[]
    preferences: string[]
    frequentErrors: string[]
    recentTopics: string[]
  }
  mode: MentorAIModeValue
  locale: 'pt-BR'
}

export type MentorGpsMissionSnapshot = {
  title: string
  description: string
  emoji: string
  route: string
  label: string
  skillKey: string
} | null

export type MentorGpsPathSnapshot = {
  nextWorldName: string | null
  nextWorldCefr: string | null
  worldsUntilAdvanced: number
  advancedTargetWorld: string
  advancedTargetCefr: string
  topMission: MentorGpsMissionSnapshot
  weeklyProjectTitle: string | null
  isSpeakingDay: boolean
  monthlyGoals: string[]
  pathSummary: string
}

export type MentorFarmBridgeSnapshot = {
  suggestedActivityKey: string | null
  suggestedActivityLabel: string | null
  suggestedActivityEmoji: string | null
  suggestedRoute: string
  minutesToday: number
  recentSummary: string | null
  coachMessage: string
}

export type MentorMotivationBridgeSnapshot = {
  dailySparkId: string | null
  dailySparkTitle: string | null
  dailySparkExcerpt: string | null
  openStreak: number
  openedToday: boolean
  coachMessage: string
}

export const MentorLLMRuntimeEngine = {
  NATIVE: 'native',
  PEDAGOGY: 'pedagogy',
} as const

export type MentorLLMRuntimeEngineValue =
  (typeof MentorLLMRuntimeEngine)[keyof typeof MentorLLMRuntimeEngine]

export type MentorLLMStatus = {
  ready: boolean
  engine: MentorLLMRuntimeEngineValue
  modelId: string
  modelLabel: string
  offlineBadge: string
}

export type MentorLLMGenerateResult = {
  text: string
  fromMock: boolean
  engine: MentorLLMRuntimeEngineValue
  latencyMs: number
  systemPrompt?: string
  topic?: string
}

export type MentorLLMStreamCallbacks = {
  onToken: (chunk: string) => void
  onDone: (result: MentorLLMGenerateResult) => void
  onError?: (error: Error) => void
}

export type MentorChatState = {
  sessionId: string | null
  messages: MentorChatMessage[]
  isGenerating: boolean
  streamingText: string
  hasHydrated: boolean
  error: string | null
  lastCapturedGoal: string | null
}

export type MentorRecommendationAction = {
  id: string
  label: string
  emoji: string
  route: string
}

export type MentorRecommendation = {
  summary: string
  insightSummary: string
  actions: MentorRecommendationAction[]
}

export type MentorExerciseQuestion = {
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type MentorExerciseSet = {
  topic: string
  title: string
  questions: MentorExerciseQuestion[]
}

export type MentorGeneratedFlashcard = {
  front: string
  back: string
  example?: string
}

export type MentorFlashcardSet = {
  topic: string
  title: string
  cards: MentorGeneratedFlashcard[]
}

export type MentorExercisePhase = 'input' | 'preview' | 'session' | 'result'

export type MentorExerciseAnswerRecord = {
  questionIndex: number
  prompt: string
  selectedIndex: number
  selectedOption: string
  correctIndex: number
  correctOption: string
  isCorrect: boolean
  explanation: string
}

export type MentorExerciseResultFeedback = {
  summary: string
  weaknesses: string[]
  improvements: string[]
}

export type MentorExerciseState = {
  topic: string
  exerciseSet: MentorExerciseSet | null
  phase: MentorExercisePhase
  isGenerating: boolean
  streamingText: string
  error: string | null
  sessionId: string | null
  currentIndex: number
  selectedIndex: number | null
  showExplanation: boolean
  correctCount: number
  answers: MentorExerciseAnswerRecord[]
  resultFeedback: MentorExerciseResultFeedback | null
  isGeneratingFeedback: boolean
}

export type MentorFlashcardPhase = 'input' | 'preview' | 'study'

export type MentorFlashcardState = {
  topic: string
  cardCount: number
  flashcardSet: MentorFlashcardSet | null
  phase: MentorFlashcardPhase
  currentIndex: number
  isGenerating: boolean
  streamingText: string
  error: string | null
  savedDeckId: string | null
  savedCount: number
}

export const MentorRoleplayMode = {
  CONVERSATION: 'conversation',
  INTERVIEW: 'interview',
} as const

export type MentorRoleplayModeValue =
  (typeof MentorRoleplayMode)[keyof typeof MentorRoleplayMode]

export const MentorRoleplayRole = {
  INTERVIEWER: 'interviewer',
  TOURIST: 'tourist',
  COWORKER: 'coworker',
  CLIENT: 'client',
  TEACHER: 'teacher',
} as const

export type MentorRoleplayRoleValue =
  (typeof MentorRoleplayRole)[keyof typeof MentorRoleplayRole]

export const MentorInterviewTrack = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  MOBILE: 'mobile',
  DEVOPS: 'devops',
  FULLSTACK: 'fullstack',
} as const

export type MentorInterviewTrackValue =
  (typeof MentorInterviewTrack)[keyof typeof MentorInterviewTrack]

export type MentorRoleplayPhase = 'pick' | 'active' | 'feedback'

export type MentorCompetencyKey = 'clarity' | 'vocabulary' | 'grammar' | 'technical'

export type MentorCompetencyScore = {
  score: number
  note: string
}

export type MentorRoleplayFeedback = {
  clarity: MentorCompetencyScore
  vocabulary: MentorCompetencyScore
  grammar: MentorCompetencyScore
  technical?: MentorCompetencyScore
  summary: string
  nextSteps: string[]
}

export type MentorRoleplayState = {
  phase: MentorRoleplayPhase
  mode: MentorRoleplayModeValue | null
  role: MentorRoleplayRoleValue | null
  track: MentorInterviewTrackValue | null
  sessionId: string | null
  messages: MentorChatMessage[]
  turnCount: number
  isGenerating: boolean
  streamingText: string
  error: string | null
  feedback: MentorRoleplayFeedback | null
}

export type MentorGreeting = {
  headline: string
  subtitle: string
}

export type MentorDashboardSnapshot = {
  context: MentorAIContext
  recommendation: MentorRecommendation
  llmStatus: MentorLLMStatus
  weeklyGoal: string | null
  monthlyGoal: string | null
  lastFeedback: string | null
  greeting: MentorGreeting
  integratedPathSummary: string
}
