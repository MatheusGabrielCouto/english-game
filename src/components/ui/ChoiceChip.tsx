import { Pressable, Text, View } from 'react-native'

import { TOUCH_TARGET_CHIP_CLASS } from '@/constants/touch-target-ui'
import { cn } from '@/utils'

type ChoiceChipProps = {
  label: string
  emoji?: string
  selected?: boolean
  onPress: () => void
  compact?: boolean
  shape?: 'rounded-xl' | 'rounded-full'
  className?: string
  accessibilityRole?: 'button' | 'switch'
  accessibilityState?: { selected?: boolean; checked?: boolean }
}

export const ChoiceChip = ({
  label,
  emoji,
  selected,
  onPress,
  compact,
  shape = 'rounded-xl',
  className,
  accessibilityRole = 'button',
  accessibilityState,
}: ChoiceChipProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole={accessibilityRole}
    accessibilityState={accessibilityState ?? (selected !== undefined ? { selected } : undefined)}
    accessibilityLabel={emoji ? `${emoji} ${label}` : label}
    className={cn(
      'shrink-0 border px-3',
      TOUCH_TARGET_CHIP_CLASS,
      shape,
      compact && 'px-2.5',
      selected ? 'border-primary bg-primary/15' : 'border-border bg-surface',
      className,
    )}>
    <View className="flex-row items-center gap-1.5">
      {emoji ? (
        <Text className={cn(compact ? 'text-xs' : 'text-sm')} style={{ lineHeight: compact ? 16 : 18 }}>
          {emoji}
        </Text>
      ) : null}
      <Text
        className={cn('font-semibold text-foreground', compact ? 'text-xs' : 'text-sm')}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
)
