import { Stack } from 'expo-router';

import { FeatureErrorBoundary } from '@/components/layout';

export default function EnglishJournalLayout() {
  return (
    <FeatureErrorBoundary feature="english-journal">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureErrorBoundary>
  );
}
