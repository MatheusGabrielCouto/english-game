import { View } from 'react-native'

import type { LearningDifficultyValue } from '@/features/game-design/constants/difficulty'

import { ProfileIdentityHero } from './ProfileIdentityHero'
import { ProfilePersonalizationSection } from './ProfilePersonalizationSection'
import { ProfileSettingsHub } from './ProfileSettingsHub'

type ProfileScreenContentProps = {
  difficulty: LearningDifficultyValue
  onDifficultyChange: (value: LearningDifficultyValue) => void
  onEditName: () => void
}

export const ProfileScreenContent = ({
  difficulty,
  onDifficultyChange,
  onEditName,
}: ProfileScreenContentProps) => (
  <View className="gap-4 pb-6">
    <ProfileIdentityHero onEditName={onEditName} />
    <ProfilePersonalizationSection />
    <ProfileSettingsHub difficulty={difficulty} onDifficultyChange={onDifficultyChange} />
  </View>
)
