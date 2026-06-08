import { GameEvents } from '@/services/game-events'
import type {
  MentorErrorLogRecord,
  MentorExerciseAnswerRecord,
  MentorExerciseResultFeedback,
  MentorExerciseSet,
} from '@/types/mentor-ai'

import {
  buildExerciseFeedbackSystemPrompt,
  buildExerciseFeedbackUserPrompt,
} from '../prompts/exercise-feedback-prompt'
import {
  buildExerciseSystemPrompt,
  buildExerciseUserPrompt,
  buildExerciseUserPromptFromErrors,
} from '../prompts/exercise-system-prompt'
import { buildErrorPracticePlan } from '../utils/build-error-practice-plan'
import { useMentorExerciseStore } from '../store/mentor-exercise-store'
import { buildExerciseResultFeedback } from '../utils/build-exercise-result-feedback'
import { createMentorId } from '../utils/create-mentor-id'
import { parseExerciseFeedback } from '../utils/parse-exercise-feedback'
import { parseExerciseResponse } from '../utils/parse-exercise-response'
import { AIContextBuilder } from './ai-context-builder'
import { LocalLLMRuntime } from './local-llm-runtime'
import { MentorExerciseEngine } from './mentor-exercise-engine'

let activeGenerationToken = 0

const syncState = (partial: Partial<ReturnType<typeof useMentorExerciseStore.getState>>) => {
  useMentorExerciseStore.setState(partial)
}

const parseExerciseCandidates = (...candidates: string[]): MentorExerciseSet | null => {
  for (const candidate of candidates) {
    const trimmed = candidate.trim()
    if (!trimmed) continue

    const parsed = parseExerciseResponse(trimmed)
    if (parsed) return parsed
  }

  return null
}

const resolveExerciseSet = async (
  topic: string,
  context: Awaited<ReturnType<typeof AIContextBuilder.buildFromGps>>,
  userPrompt?: string,
): Promise<MentorExerciseSet> => {
  const offline = MentorExerciseEngine.tryGenerate(topic, context)
  if (offline) return offline

  const systemPrompt = buildExerciseSystemPrompt(context)
  let streamed = ''

  const llmResult = await LocalLLMRuntime.generateStream(
    {
      context,
      userMessage: userPrompt ?? buildExerciseUserPrompt(topic),
      systemPrompt,
      llmOptions: {
        temperature: 0.3,
        topP: 0.9,
        nPredict: 1024,
      },
    },
    {
      onToken: (chunk) => {
        streamed += chunk
        syncState({ streamingText: streamed })
      },
      onDone: () => {},
    },
  )

  const parsed = parseExerciseCandidates(llmResult.text, streamed)
  if (parsed) return parsed

  const fallback = MentorExerciseEngine.tryGenerate(topic, context)
  if (fallback) return fallback

  throw new Error('Não foi possível gerar exercícios. Tente outro tema.')
}

const resolveResultFeedback = async (
  exerciseSet: MentorExerciseSet,
  answers: MentorExerciseAnswerRecord[],
): Promise<MentorExerciseResultFeedback> => {
  const offline = buildExerciseResultFeedback(exerciseSet, answers)

  try {
    const context = await AIContextBuilder.buildFromGps()
    const result = await LocalLLMRuntime.generate({
      context,
      userMessage: buildExerciseFeedbackUserPrompt(exerciseSet, answers),
      systemPrompt: buildExerciseFeedbackSystemPrompt(),
      llmOptions: { temperature: 0.3, nPredict: 512 },
    })

    const parsed = parseExerciseFeedback(result.text)
    if (parsed) return parsed
  } catch {
    // offline fallback
  }

  return offline
}

const completeSession = async (): Promise<void> => {
  const { exerciseSet, answers, sessionId } = useMentorExerciseStore.getState()
  if (!exerciseSet) return

  const token = ++activeGenerationToken

  syncState({
    phase: 'result',
    showExplanation: false,
    selectedIndex: null,
    resultFeedback: null,
    isGeneratingFeedback: true,
  })

  if (sessionId) {
    GameEvents.emit({ type: 'MENTOR_EXERCISE_COMPLETED', sessionId })
  }

  try {
    const feedback = await resolveResultFeedback(exerciseSet, answers)
    if (token !== activeGenerationToken) return

    syncState({
      resultFeedback: feedback,
      isGeneratingFeedback: false,
    })
  } catch {
    if (token !== activeGenerationToken) return

    syncState({
      resultFeedback: buildExerciseResultFeedback(exerciseSet, answers),
      isGeneratingFeedback: false,
    })
  }
}

export const MentorExerciseService = {
  setTopic(topic: string): void {
    syncState({ topic, error: null })
  },

  reset(): void {
    activeGenerationToken += 1
    useMentorExerciseStore.getState().reset()
  },

  cancelGeneration(): void {
    activeGenerationToken += 1
    syncState({ isGenerating: false, streamingText: '' })
  },

  async generateFromErrors(errors: MentorErrorLogRecord[]): Promise<MentorExerciseSet | null> {
    if (errors.length === 0) return null

    const token = ++activeGenerationToken
    const plan = buildErrorPracticePlan(errors)

    syncState({
      topic: plan.topicLabel,
      exerciseSet: null,
      phase: 'input',
      isGenerating: true,
      streamingText: '',
      error: null,
      sessionId: null,
      currentIndex: 0,
      selectedIndex: null,
      showExplanation: false,
      correctCount: 0,
      answers: [],
      resultFeedback: null,
      isGeneratingFeedback: false,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const offlineSet = MentorExerciseEngine.tryGenerateFromErrors(errors, context)

      if (offlineSet && offlineSet.questions.length > 0) {
        if (token !== activeGenerationToken) return null

        syncState({
          exerciseSet: offlineSet,
          phase: 'preview',
          isGenerating: false,
          streamingText: '',
        })

        return offlineSet
      }

      const exerciseSet = await resolveExerciseSet(
        plan.topicLabel,
        context,
        buildExerciseUserPromptFromErrors(plan.llmPrompt),
      )

      if (token !== activeGenerationToken) return null

      syncState({
        exerciseSet,
        phase: 'preview',
        isGenerating: false,
        streamingText: '',
      })

      return exerciseSet
    } catch (error) {
      if (token !== activeGenerationToken) return null

      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível gerar exercícios.',
      })

      return null
    }
  },

  async generateExercise(rawTopic?: string): Promise<MentorExerciseSet | null> {
    const topic = (rawTopic ?? useMentorExerciseStore.getState().topic).trim()
    if (!topic) return null

    const token = ++activeGenerationToken

    syncState({
      topic,
      exerciseSet: null,
      phase: 'input',
      isGenerating: true,
      streamingText: '',
      error: null,
      sessionId: null,
      currentIndex: 0,
      selectedIndex: null,
      showExplanation: false,
      correctCount: 0,
      answers: [],
      resultFeedback: null,
      isGeneratingFeedback: false,
    })

    try {
      const context = await AIContextBuilder.buildFromGps()
      const exerciseSet = await resolveExerciseSet(topic, context)

      if (token !== activeGenerationToken) return null

      syncState({
        exerciseSet,
        phase: 'preview',
        isGenerating: false,
        streamingText: '',
      })

      return exerciseSet
    } catch (error) {
      if (token !== activeGenerationToken) return null

      syncState({
        isGenerating: false,
        streamingText: '',
        error: error instanceof Error ? error.message : 'Não foi possível gerar exercícios.',
      })

      return null
    }
  },

  startSession(): void {
    const { exerciseSet } = useMentorExerciseStore.getState()
    if (!exerciseSet || exerciseSet.questions.length === 0) return

    syncState({
      phase: 'session',
      sessionId: createMentorId('mentor_exercise'),
      currentIndex: 0,
      selectedIndex: null,
      showExplanation: false,
      correctCount: 0,
      answers: [],
      resultFeedback: null,
      isGeneratingFeedback: false,
    })
  },

  selectAnswer(index: number): void {
    const { phase, showExplanation } = useMentorExerciseStore.getState()
    if (phase !== 'session' || showExplanation) return

    syncState({ selectedIndex: index })
  },

  confirmAnswer(): void {
    const { exerciseSet, currentIndex, selectedIndex, answers } =
      useMentorExerciseStore.getState()
    if (!exerciseSet || selectedIndex === null) return

    const question = exerciseSet.questions[currentIndex]
    if (!question) return

    const isCorrect = selectedIndex === question.correctIndex
    const record: MentorExerciseAnswerRecord = {
      questionIndex: currentIndex,
      prompt: question.prompt,
      selectedIndex,
      selectedOption: question.options[selectedIndex] ?? '',
      correctIndex: question.correctIndex,
      correctOption: question.options[question.correctIndex] ?? '',
      isCorrect,
      explanation: question.explanation,
    }

    syncState({
      showExplanation: true,
      answers: [...answers, record],
      correctCount: isCorrect
        ? useMentorExerciseStore.getState().correctCount + 1
        : useMentorExerciseStore.getState().correctCount,
    })
  },

  nextQuestion(): void {
    const { exerciseSet, currentIndex } = useMentorExerciseStore.getState()
    if (!exerciseSet) return

    const nextIndex = currentIndex + 1
    if (nextIndex >= exerciseSet.questions.length) {
      void completeSession()
      return
    }

    syncState({
      currentIndex: nextIndex,
      selectedIndex: null,
      showExplanation: false,
    })
  },

  backToPreview(): void {
    syncState({
      phase: 'preview',
      sessionId: null,
      currentIndex: 0,
      selectedIndex: null,
      showExplanation: false,
      correctCount: 0,
      answers: [],
      resultFeedback: null,
      isGeneratingFeedback: false,
    })
  },
}
