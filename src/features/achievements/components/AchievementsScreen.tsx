import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { AchievementsScreenContent } from './AchievementsScreenContent';

export const AchievementsScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Conquistas"
      subtitle="Marcos permanentes da sua jornada"
      emoji="🏆"
    />
    <AchievementsScreenContent />
  </ScreenContainer>
);
