import { Text, View } from 'react-native'

import { ProgressBar } from '@/components'
import type { SkillLevelRecord } from '@/types/learning-gps'

import { LEARNING_SKILL_BY_KEY } from '../constants/learning-skills'

type LearningGpsSkillBarProps = {
  skill: SkillLevelRecord
  compact?: boolean
}

export const LearningGpsSkillBar = ({ skill, compact = false }: LearningGpsSkillBarProps) => {
  const definition = LEARNING_SKILL_BY_KEY[skill.skillKey]

  return (
    <View className={compact ? 'gap-1' : 'gap-1.5'}>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="text-xs font-semibold text-foreground-secondary" numberOfLines={1}>
          {definition.emoji} {definition.label}
        </Text>
        <Text className="text-xs font-bold text-foreground">{skill.level}</Text>
      </View>
      <ProgressBar value={skill.level} max={100} height={compact ? 'sm' : 'md'} />
    </View>
  )
}
