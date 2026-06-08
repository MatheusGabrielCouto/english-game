import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import type { MentorExerciseResultFeedback } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorExerciseResultFeedbackProps = {
  feedback: MentorExerciseResultFeedback
}

export const MentorExerciseResultFeedbackCard = ({ feedback }: MentorExerciseResultFeedbackProps) => (
  <View className="gap-3">
    <GameCard variant="default" className="gap-2">
      <Text className="text-[10px] font-black uppercase tracking-widest text-accent">
        {MENTOR_AI_UI.characterName}
      </Text>
      <Text className="text-sm leading-6 text-foreground-secondary">{feedback.summary}</Text>
    </GameCard>

    {feedback.weaknesses.length > 0 ? (
      <GameCard variant="default" className="gap-2">
        <Text className="text-xs font-black uppercase tracking-widest text-danger">
          {MENTOR_AI_UI.exercise.weaknessesTitle}
        </Text>
        {feedback.weaknesses.map((item, index) => (
          <Text key={`${item}-${index}`} className="text-sm leading-5 text-foreground-secondary">
            • {item}
          </Text>
        ))}
      </GameCard>
    ) : null}

    <GameCard variant="default" className="gap-2">
      <Text className="text-xs font-black uppercase tracking-widest text-success">
        {MENTOR_AI_UI.exercise.improvementsTitle}
      </Text>
      {feedback.improvements.map((item, index) => (
        <Text key={`${item}-${index}`} className="text-sm leading-5 text-foreground-secondary">
          {index + 1}. {item}
        </Text>
      ))}
    </GameCard>
  </View>
)
