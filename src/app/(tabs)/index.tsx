import { useRef } from 'react';
import type { ScrollView, View } from 'react-native';

import { FeatureErrorBoundary, ScreenContainer, ScreenHeader } from '@/components/layout';
import { HomeScrollProvider } from '@/features/home/context/home-scroll-context';
import { HomeScreenContent } from '@/features/home';
import { HOME_UI } from '@/features/home/constants/home-ui';
import { useCoachMarkHomeScroll } from '@/features/tutorial/hooks/use-coach-mark-home-scroll';

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);

  useCoachMarkHomeScroll(scrollRef);

  return (
    <FeatureErrorBoundary feature="home" showGoBack={false}>
      <HomeScrollProvider value={{ contentRef }}>
        <ScreenContainer scrollable scrollRef={scrollRef} contentRef={contentRef}>
          <ScreenHeader title={HOME_UI.screenTitle} subtitle={HOME_UI.screenSubtitle} emoji="🎮" />
          <HomeScreenContent />
        </ScreenContainer>
      </HomeScrollProvider>
    </FeatureErrorBoundary>
  );
}
