import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { QuestsScreenContent } from '@/features/quests';

export default function QuestsScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        title="Missões"
        subtitle="Complete, evolua e mantenha sua streak"
        emoji="⚔️"
      />
      <QuestsScreenContent />
    </ScreenContainer>
  );
}
