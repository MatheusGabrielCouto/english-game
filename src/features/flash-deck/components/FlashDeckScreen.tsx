import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { FLASH_DECK_UI } from '../constants/flash-deck-ui';
import { FlashDeckHubContent } from './FlashDeckHubContent';

export const FlashDeckScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={FLASH_DECK_UI.screenTitle}
      subtitle="Sua mesa de cartas — revise e suba de nível"
      emoji={FLASH_DECK_UI.emoji}
    />
    <View className="pt-2">
      <FlashDeckHubContent />
    </View>
  </ScreenContainer>
);
