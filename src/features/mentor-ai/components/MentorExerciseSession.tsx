import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { McqQuestionCard } from '@/features/duels/components/McqQuestionCard'
import {
    LearningOutcomePanel,
    LearningProgressHeader,
} from '@/features/learning/components/ui'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorExercise } from '../hooks/use-mentor-exercise'
import { MentorExerciseResultFeedbackCard } from './MentorExerciseResultFeedback'

export const MentorExerciseSession = () => {
  const {
    exerciseSet,
    phase,
    currentIndex,
    selectedIndex,
    showExplanation,
    correctCount,
    resultFeedback,
    isGeneratingFeedback,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    backToPreview,
    reset,
  } = useMentorExercise()

  if (!exerciseSet) return null

  if (phase === 'result') {
    const total = exerciseSet.questions.length
    const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0

    return (
      <View className="gap-4">
        <LearningOutcomePanel
          variant="complete"
          title={MENTOR_AI_UI.exercise.resultTitle}
          body={MENTOR_AI_UI.exercise.resultBody(correctCount, total, scorePct)}
        />

        {isGeneratingFeedback ? (
          <GameCard variant="default" className="gap-2">
            <Text className="text-sm text-foreground-secondary">
              {MENTOR_AI_UI.exercise.generatingFeedback}
            </Text>
          </GameCard>
        ) : resultFeedback ? (
          <MentorExerciseResultFeedbackCard feedback={resultFeedback} />
        ) : null}

        <Button label={MENTOR_AI_UI.exercise.tryAnother} onPress={reset} />
        <Button
          label={MENTOR_AI_UI.exercise.backToPreview}
          variant="secondary"
          onPress={backToPreview}
        />
      </View>
    )
  }

  const question = exerciseSet.questions[currentIndex]
  if (!question) return null

  const prompt = {
    stem: question.prompt,
    choices: question.options,
    correctIndex: question.correctIndex,
  }

  const isCorrect = selectedIndex === question.correctIndex

  return (
    <View className="gap-4">
      <LearningProgressHeader
        questLabel={exerciseSet.title}
        current={currentIndex + 1}
        total={exerciseSet.questions.length}
      />

      <McqQuestionCard
        prompt={prompt}
        selectedIndex={selectedIndex}
        onSelect={selectAnswer}
        disabled={showExplanation}
      />

      {showExplanation ? (
        <GameCard variant="default" className="gap-2">
          <Text
            className={`text-sm font-bold ${isCorrect ? 'text-success' : 'text-danger'}`}>
            {isCorrect ? MENTOR_AI_UI.exercise.correct : MENTOR_AI_UI.exercise.incorrect}
          </Text>
          <Text className="text-sm leading-6 text-foreground-secondary">{question.explanation}</Text>
          <Button
            label={
              currentIndex + 1 >= exerciseSet.questions.length
                ? MENTOR_AI_UI.exercise.finish
                : MENTOR_AI_UI.exercise.next
            }
            onPress={nextQuestion}
          />
        </GameCard>
      ) : (
        <Button
          label={MENTOR_AI_UI.exercise.confirm}
          onPress={confirmAnswer}
          disabled={selectedIndex === null}
        />
      )}
    </View>
  )
}
