import { Text, View } from 'react-native'

import { cn } from '@/utils'

type HomeSectionLabelProps = {
  emoji: string
  title: string
  subtitle?: string
  tone?: 'primary' | 'accent' | 'warning' | 'gold' | 'legendary' | 'success'
  className?: string
}

const toneStyles = {
  primary: 'text-primary',
  accent: 'text-accent',
  warning: 'text-warning',
  gold: 'text-gold',
  legendary: 'text-legendary',
  success: 'text-success',
}

export const HomeSectionLabel = ({
  emoji,
  title,
  subtitle,
  tone = 'primary',
  className,
}: HomeSectionLabelProps) => (
  <View className={cn('gap-0.5', className)}>
    <Text className={cn('text-[10px] font-black uppercase tracking-[0.2em]', toneStyles[tone])}>
      {emoji} {title}
    </Text>
    {subtitle ? (
      <Text className="text-xs leading-4 text-foreground-secondary">{subtitle}</Text>
    ) : null}
  </View>
)
