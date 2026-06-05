import { Text, View } from 'react-native'

import { GameDisplayText } from '@/components/ui/game'

import { SHOP_TEXT } from '../constants/shop-ui'

type ShopSectionHeaderProps = {
  kicker?: string
  kickerClassName?: string
  title: string
  subtitle?: string
  trailing?: React.ReactNode
}

export const ShopSectionHeader = ({
  kicker,
  kickerClassName = SHOP_TEXT.kickerNeutral,
  title,
  subtitle,
  trailing,
}: ShopSectionHeaderProps) => (
  <View className="flex-row items-start justify-between gap-3 px-0.5">
    <View className="flex-1 gap-1">
      {kicker ? (
        <GameDisplayText variant="label" className={kickerClassName}>
          {kicker}
        </GameDisplayText>
      ) : null}
      <GameDisplayText variant="section">{title}</GameDisplayText>
      {subtitle ? <Text className={SHOP_TEXT.body}>{subtitle}</Text> : null}
    </View>
    {trailing ?? null}
  </View>
)
