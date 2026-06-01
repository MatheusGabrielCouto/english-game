import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { FocusModeScreen } from '@/features/focus-mode/components/FocusModeScreen';

export default function FocusModeRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title="Focus Mode"
        subtitle="Sessões de estudo com recompensas e monitoramento ético"
        emoji="🎯"
      />
      <FocusModeScreen />
    </ScreenContainer>
  );
}
