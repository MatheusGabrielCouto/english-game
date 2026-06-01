import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { TitlesScreenContent } from './TitlesScreenContent';

export const TitlesScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Títulos"
      subtitle="Sua evolução profissional internacional"
      emoji="👑"
    />
    <TitlesScreenContent />
  </ScreenContainer>
);
