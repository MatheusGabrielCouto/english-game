
import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { ROUTINE_UI } from '../constants/routine-ui';
import { RoutinesScreenContent } from './RoutinesScreenContent';

export const RoutinesScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title={ROUTINE_UI.screenTitle}
      subtitle={ROUTINE_UI.screenSubtitle}
      emoji="📋"
    />
    <RoutinesScreenContent />
  </ScreenContainer>
);
