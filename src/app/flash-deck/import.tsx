import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { FlashDeckImportContent } from '@/features/flash-deck/components/FlashDeckImportContent';
import { FLASH_DECK_UI } from '@/features/flash-deck/constants/flash-deck-ui';

export default function FlashDeckImportScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={FLASH_DECK_UI.importCsvTitle} emoji={FLASH_DECK_UI.emoji} />
      <View className="pt-2">
        <FlashDeckImportContent />
      </View>
    </ScreenContainer>
  );
}
