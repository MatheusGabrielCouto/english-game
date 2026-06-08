import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import { LearningGpsSkillBar } from '@/features/learning-gps/components/LearningGpsSkillBar'
import type { MentorAIContext } from '@/types/mentor-ai'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'

type MentorSkillExtremesCardProps = {
  context: MentorAIContext
}

export const MentorSkillExtremesCard = ({ context }: MentorSkillExtremesCardProps) => {
  const strongest = LEARNING_SKILL_BY_KEY[context.skills.strongest]
  const weakest = LEARNING_SKILL_BY_KEY[context.skills.weakest]
  const strongestLevel = context.skills[context.skills.strongest]
  const weakestLevel = context.skills[context.skills.weakest]

  return (
    <GameCard variant="default" className="gap-3">
      <View className="gap-0.5">
        <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
          {MENTOR_AI_UI.dashboard.skillsTitle}
        </Text>
        {context.learningGps.activeUnitTitle ? (
          <Text className="text-xs leading-5 text-foreground-secondary" numberOfLines={1}>
            {context.learningGps.activeUnitTitle}
          </Text>
        ) : null}
      </View>

      <View className="flex-row gap-2.5">
        <View className="flex-1 rounded-xl border border-success/30 bg-success/5 px-3 py-2.5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-success">
            {MENTOR_AI_UI.dashboard.strongestLabel}
          </Text>
          <Text className="mt-1 text-sm font-black text-foreground">
            {strongest.emoji} {strongest.label}
          </Text>
          <Text className="text-xs font-bold text-success">{strongestLevel}/100</Text>
        </View>

        <View className="flex-1 rounded-xl border border-warning/30 bg-warning/5 px-3 py-2.5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-warning">
            {MENTOR_AI_UI.dashboard.weakestLabel}
          </Text>
          <Text className="mt-1 text-sm font-black text-foreground">
            {weakest.emoji} {weakest.label}
          </Text>
          <Text className="text-xs font-bold text-warning">{weakestLevel}/100</Text>
        </View>
      </View>

      <LearningGpsSkillBar
        skill={{ skillKey: context.skills.weakest, level: weakestLevel, updatedAt: context.generatedAt }}
        compact
      />
    </GameCard>
  )
}
