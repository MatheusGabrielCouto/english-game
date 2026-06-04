import { Text, View } from 'react-native'

import { cn } from '@/utils'

type ResourceTone = 'gold' | 'accent' | 'primary'

type HomePlayerResourceTileProps = {
  emoji: string
  label: string
  value: string
  suffix?: string
  tone?: ResourceTone
  className?: string
}

const toneStyles: Record<ResourceTone, { border: string; bg: string; value: string }> = {
  gold: {
    border: 'border-gold/35',
    bg: 'bg-gold/12',
    value: 'text-gold',
  },
  accent: {
    border: 'border-accent/35',
    bg: 'bg-accent/12',
    value: 'text-accent',
  },
  primary: {
    border: 'border-primary/35',
    bg: 'bg-primary/12',
    value: 'text-primary',
  },
}

export const HomePlayerResourceTile = ({
  emoji,
  label,
  value,
  suffix,
  tone = 'primary',
  className,
}: HomePlayerResourceTileProps) => {
  const palette = toneStyles[tone]

  return (
    <View
      className={cn(
        'min-w-0 flex-1 rounded-xl border px-3 py-2.5',
        palette.border,
        palette.bg,
        className,
      )}>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-base">{emoji}</Text>
        <Text
          className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-secondary"
          numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View className="mt-1.5 flex-row items-end gap-1">
        <Text
          className={cn('shrink text-2xl font-black leading-none', palette.value)}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          {value}
        </Text>
        {suffix ? (
          <Text className="pb-0.5 text-xs font-bold uppercase text-foreground-secondary">{suffix}</Text>
        ) : null}
      </View>
    </View>
  )
}
