import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components'
import { theme } from '@/constants'
import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants'
import type { LootBoxRarityValue } from '@/types/inventory'
import { cn } from '@/utils'

import { getRarityAccentBarColor, LOOT_BOX_RARITY_STYLES } from '../constants/loot-box-rarity-styles'
import { SHOP_TEXT } from '../constants/shop-ui'

export type LootBoxUpgradeStepDisplay = {
  from: LootBoxRarityValue
  to: LootBoxRarityValue
  costStudyPoints: number
  ownedCount: number
}

type ShopLootBoxUpgradeCardProps = {
  step: LootBoxUpgradeStepDisplay
  balance: number
  isBusy?: boolean
  onUpgrade: (fromRarity: LootBoxRarityValue) => void
}

export const ShopLootBoxUpgradeCard = ({
  step,
  balance,
  isBusy = false,
  onUpgrade,
}: ShopLootBoxUpgradeCardProps) => {
  const fromStyle = LOOT_BOX_RARITY_STYLES[step.from]
  const toStyle = LOOT_BOX_RARITY_STYLES[step.to]
  const fromConfig = LOOT_BOX_RARITY_CONFIG[step.from]
  const toConfig = LOOT_BOX_RARITY_CONFIG[step.to]
  const hasBox = step.ownedCount > 0
  const hasSp = balance >= step.costStudyPoints
  const canUpgrade = hasBox && hasSp && !isBusy

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border bg-surface-elevated/80',
        canUpgrade ? 'border-accent/35' : 'border-border',
      )}>
      <View style={[styles.topBar, { backgroundColor: getRarityAccentBarColor(step.to) }]} />

      <View className="gap-3 p-4">
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <Text className="text-sm font-black text-foreground">
            {fromConfig.emoji} {fromStyle.label}
          </Text>
          <Text className="text-sm font-bold text-foreground-secondary">→</Text>
          <Text className="text-sm font-black" style={{ color: toStyle.badge.color }}>
            {toConfig.emoji} {toStyle.label}
          </Text>
          <View className="rounded-full border border-border bg-surface px-2.5 py-1">
            <Text className={SHOP_TEXT.badge}>
              {hasBox ? `×${step.ownedCount} no inventário` : '×0'}
            </Text>
          </View>
        </View>

        <Text className={SHOP_TEXT.bodySmall}>
          Consome 1 caixa {fromStyle.label.toLowerCase()} fechada e adiciona 1 caixa{' '}
          {toStyle.label.toLowerCase()}.
        </Text>

        <View className="flex-row items-end justify-between gap-3 border-t border-border/60 pt-3">
          <View className="flex-1">
            <Text className={SHOP_TEXT.caption}>Custo</Text>
            <Text className={cn('text-lg font-black', hasSp ? 'text-accent' : 'text-foreground')}>
              {step.costStudyPoints.toLocaleString('pt-BR')} SP
            </Text>
          </View>

          {!hasBox ? (
            <Text className={`max-w-[42%] text-right ${SHOP_TEXT.warning}`}>
              Sem caixa fechada dessa raridade
            </Text>
          ) : !hasSp ? (
            <Text className={`max-w-[42%] text-right ${SHOP_TEXT.warning}`}>SP insuficientes</Text>
          ) : (
            <View className="min-w-[108px]">
              {isBusy ? (
                <View className="h-10 flex-row items-center justify-center gap-2 rounded-xl bg-primary/15">
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text className="text-xs font-bold text-primary">Upgrading…</Text>
                </View>
              ) : (
                <Button label="Upgrade" size="sm" onPress={() => onUpgrade(step.from)} />
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    height: 4,
    width: '100%',
  },
})
