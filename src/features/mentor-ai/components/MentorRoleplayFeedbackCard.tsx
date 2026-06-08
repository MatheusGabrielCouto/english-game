import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import type { MentorCompetencyKey, MentorRoleplayFeedback } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorRoleplayFeedbackCardProps = {
  feedback: MentorRoleplayFeedback
  showTechnical?: boolean
}

const COMPETENCY_ORDER: MentorCompetencyKey[] = ['clarity', 'vocabulary', 'grammar', 'technical']

const scoreBar = (score: number): string => '█'.repeat(score) + '░'.repeat(5 - score)

export const MentorRoleplayFeedbackCard = ({
  feedback,
  showTechnical = false,
}: MentorRoleplayFeedbackCardProps) => {
  const keys = showTechnical
    ? COMPETENCY_ORDER
    : COMPETENCY_ORDER.filter((key) => key !== 'technical')

  return (
    <View className="gap-3">
      <GameCard variant="default" className="gap-2">
        <Text className="text-sm font-black uppercase tracking-widest text-muted">
          {MENTOR_AI_UI.roleplay.feedbackTitle}
        </Text>
        <Text className="text-sm leading-6 text-foreground-secondary">{feedback.summary}</Text>
      </GameCard>

      {keys.map((key) => {
        const entry = feedback[key]
        if (!entry) return null

        return (
          <GameCard key={key} variant="default" className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-black uppercase tracking-widest text-accent">
                {MENTOR_AI_UI.roleplay.competencies[key]}
              </Text>
              <Text className="text-xs font-bold text-foreground">
                {entry.score}/5 {scoreBar(entry.score)}
              </Text>
            </View>
            <Text className="text-sm leading-5 text-foreground-secondary">{entry.note}</Text>
          </GameCard>
        )
      })}

      <GameCard variant="default" className="gap-2">
        <Text className="text-xs font-black uppercase tracking-widest text-muted">
          {MENTOR_AI_UI.roleplay.nextStepsTitle}
        </Text>
        {feedback.nextSteps.map((step, index) => (
          <Text key={`${step}-${index}`} className="text-sm leading-5 text-foreground-secondary">
            {index + 1}. {step}
          </Text>
        ))}
      </GameCard>
    </View>
  )
}
