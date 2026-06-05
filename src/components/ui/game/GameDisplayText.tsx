import { Text, type TextProps } from 'react-native'

import { fontFamilies } from '@/constants/fonts'
import { cn } from '@/utils'

export type GameDisplayVariant = 'hero' | 'section' | 'title' | 'label' | 'value'

type GameDisplayTextProps = TextProps & {
  variant?: GameDisplayVariant
  className?: string
}

const variantClasses: Record<GameDisplayVariant, string> = {
  hero: 'text-game-display-hero text-foreground',
  section: 'text-game-display-section text-foreground',
  title: 'text-game-display text-foreground',
  label: 'text-game-display-label uppercase text-primary',
  value: 'text-game-display-value text-gold',
}

export const GameDisplayText = ({
  variant = 'title',
  className,
  style,
  ...props
}: GameDisplayTextProps) => (
  <Text
    className={cn('font-display', variantClasses[variant], className)}
    style={[{ fontFamily: fontFamilies.display }, style]}
    {...props}
  />
)
