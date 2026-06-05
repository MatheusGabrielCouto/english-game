import { FeatureErrorBoundary, ScreenContainer, ScreenHeader } from '@/components/layout'
import { PLAY_UI, PlayScreenContent } from '@/features/play'

export default function PlayScreen() {
  return (
    <FeatureErrorBoundary feature="play" showGoBack={false}>
      <ScreenContainer scrollable>
        <ScreenHeader title={PLAY_UI.screenTitle} subtitle={PLAY_UI.screenSubtitle} emoji="🎯" />
        <PlayScreenContent />
      </ScreenContainer>
    </FeatureErrorBoundary>
  )
}
