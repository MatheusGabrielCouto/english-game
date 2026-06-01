import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { LearningInsightsContent } from '@/features/learning/components/LearningInsightsContent';

export default function LearningInsightsScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title="Hall do aprendizado"
        subtitle="Estatísticas da sua jornada"
        emoji="📊"
      />
      <View className="pt-2">
        <LearningInsightsContent />
      </View>
    </ScreenContainer>
  );
}
