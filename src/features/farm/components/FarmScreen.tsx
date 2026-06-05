import { View } from 'react-native'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { FARM_UI } from '@/features/farm/constants/farm-ui'

import { FarmScreenContent } from './FarmScreenContent'

export const FarmScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={FARM_UI.title}
      subtitle={FARM_UI.subtitle}
      emoji={FARM_UI.emoji}
    />
    <View className="pt-2">
      <FarmScreenContent />
    </View>
  </ScreenContainer>
)
