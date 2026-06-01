import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { InventoryScreenContent } from '@/features/inventory';

export default function InventoryScreen() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        title="Inventário"
        subtitle="Sua bolsa de aventura — escudos, loot e companheiros"
        emoji="🎒"
      />
      <InventoryScreenContent />
    </ScreenContainer>
  );
}
