import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { HomeScreenContent } from '@/features/home';

export default function HomeScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader title="English Quest" subtitle="Seu mundo de evolução profissional" emoji="🎮" />
      <HomeScreenContent />
    </ScreenContainer>
  );
}
