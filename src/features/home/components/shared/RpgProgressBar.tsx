import { View } from 'react-native'

import { ProgressBar } from '@/components'
import { cn } from '@/utils'

type RpgProgressBarProps = {
  value: number
  max?: number
  variant?: 'default' | 'xp' | 'streak' | 'gold'
  height?: 'sm' | 'md' | 'lg'
  label?: string
  showLabel?: boolean
  className?: string
  animated?: boolean
}

export const RpgProgressBar = ({
  value,
  max = 100,
  variant = 'default',
  height = 'lg',
  label,
  showLabel,
  className,
  animated = true,
}: RpgProgressBarProps) => (
  <View className={cn('overflow-hidden rounded-xl border border-border/60 bg-surface-elevated/80 p-1', className)}>
    <ProgressBar
      value={value}
      max={max}
      variant={variant}
      height={height}
      label={label}
      showLabel={showLabel}
      animated={animated}
    />
  </View>
)
