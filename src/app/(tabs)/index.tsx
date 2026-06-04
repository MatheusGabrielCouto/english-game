import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { HomeScreenContent } from '@/features/home';
import { HOME_UI } from '@/features/home/constants/home-ui';

export default function HomeScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={HOME_UI.screenTitle} subtitle={HOME_UI.screenSubtitle} emoji="🎮" />
      <HomeScreenContent />
    </ScreenContainer>
  );
}
