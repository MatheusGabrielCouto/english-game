import { View } from 'react-native'

import { ScreenSkeleton } from '@/components/ui/skeleton'

import { useInventory } from '../hooks/use-inventory'
import { InventoryCollapsibleSection } from './InventoryCollapsibleSection'
import { InventoryHeroCard } from './InventoryHeroCard'
import { InventoryHistoryList } from './InventoryHistoryList'
import { InventoryLootBoxCard } from './InventoryLootBoxCard'
import { InventoryPetCard } from './InventoryPetCard'
import { InventoryShieldCard } from './InventoryShieldCard'
import { InventorySpecialItemsCard } from './InventorySpecialItemsCard'

export const InventoryScreenContent = () => {
  const { snapshot, history, isLoading } = useInventory()

  if (isLoading || !snapshot) {
    return <ScreenSkeleton variant="hero-list" listCount={4} className="gap-3" />
  }

  const specialItemsCount = snapshot.specialItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )
  const hasLootBoxes = snapshot.lootBoxes.total > 0
  const hasShields = snapshot.shields.quantity > 0
  const hasPet = snapshot.pet != null
  const hasSpecialItems = specialItemsCount > 0

  return (
    <View className="gap-3 pb-4">
      <InventoryHeroCard
        shields={snapshot.shields.quantity}
        lootBoxes={snapshot.lootBoxes.total}
        specialItems={specialItemsCount}
        analytics={snapshot.analytics}
      />

      <InventoryCollapsibleSection
        title="Loot Boxes"
        emoji="📦"
        subtitle={
          hasLootBoxes
            ? 'Toque em uma caixa ou abra todas de uma vez'
            : 'Caixas de recompensa aparecem aqui'
        }
        badge={hasLootBoxes ? `${snapshot.lootBoxes.total} fechadas` : undefined}
        badgeTone={hasLootBoxes ? 'reward' : 'default'}
        defaultOpen={hasLootBoxes}>
        <InventoryLootBoxCard lootBoxes={snapshot.lootBoxes} hideHeader />
      </InventoryCollapsibleSection>

      <InventoryCollapsibleSection
        title="Escudos de Streak"
        emoji="🛡️"
        subtitle="Protegem sua sequência nos dias perdidos"
        badge={hasShields ? `${snapshot.shields.quantity} em estoque` : 'Vazio'}
        defaultOpen={hasShields}>
        <InventoryShieldCard quantity={snapshot.shields.quantity} hideHeader />
      </InventoryCollapsibleSection>

      <InventoryCollapsibleSection
        title="Companheiro"
        emoji="🐾"
        subtitle={hasPet ? 'Toque para cuidar do seu pet' : 'Seu pet de aventura'}
        badge={hasPet ? `Nv. ${snapshot.pet!.level}` : undefined}
        defaultOpen={hasPet}>
        <InventoryPetCard pet={snapshot.pet} hideHeader />
      </InventoryCollapsibleSection>

      <InventoryCollapsibleSection
        title="Itens Especiais"
        emoji="✨"
        subtitle="Toque para usar boosters, tickets e consumíveis"
        badge={hasSpecialItems ? `${specialItemsCount} un.` : undefined}
        defaultOpen={hasSpecialItems}>
        <InventorySpecialItemsCard items={snapshot.specialItems} hideHeader />
      </InventoryCollapsibleSection>

      <InventoryCollapsibleSection
        title="Registro de Loot"
        emoji="📜"
        subtitle="Últimas aquisições da sua aventura"
        badge={history.length > 0 ? `${history.length} entradas` : undefined}>
        <InventoryHistoryList history={history} hideHeader />
      </InventoryCollapsibleSection>
    </View>
  )
}
