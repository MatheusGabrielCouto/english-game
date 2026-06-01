import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { DUEL_UI } from '../constants/duel-ui';
import { DuelBattleContent } from './DuelBattleContent';

export const DuelBattleScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={DUEL_UI.battleTitle}
      subtitle="Responda e vença o inimigo"
      emoji={DUEL_UI.emoji}
    />
    <View className="pt-2">
      <DuelBattleContent />
    </View>
  </ScreenContainer>
);
