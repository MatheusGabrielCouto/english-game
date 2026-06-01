import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { DUEL_UI } from '../constants/duel-ui';
import { PatentExamContent } from './PatentExamContent';

export const PatentExamScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={DUEL_UI.examTitle}
      subtitle="Prove que merece subir de patente"
      emoji="📜"
    />
    <View className="pt-2">
      <PatentExamContent />
    </View>
  </ScreenContainer>
);
