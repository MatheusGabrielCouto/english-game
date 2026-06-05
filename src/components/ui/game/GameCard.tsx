/**
 * Card de gameplay — bordas temáticas, variantes hero/quest/reward e glow opcional.
 * Settings e formulários: use `Card` em `src/components/ui/Card.tsx`.
 * `sharedTransitionTag` — anima o card entre telas (ex.: Home → Pet).
 * Com `PressableScale`, `pressGlow` anima ripple + borda (default quando `glow`).
 * A11y: `text-muted` em cards — mín. 12px; ver `CARD_MUTED_CAPTION_CLASS`.
 * @see docs/DESIGN_SYSTEM.md
 */
import { type ReactNode } from 'react'
import { Platform, View, type ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'

import {
  heroCardSharedTransition,
  SHARED_ELEMENT_TRANSITIONS_ENABLED,
  type SharedTransitionTag,
} from '@/constants/shared-transitions'
import type { GameCardVariant } from '@/constants/game-card-press-ui'
import { cn } from '@/utils'

import { GameCardPressGlow } from './GameCardPressGlow'

export type { GameCardVariant }

type GameCardProps = ViewProps & {
  children: ReactNode
  variant?: GameCardVariant
  className?: string
  glow?: boolean
  /** Ripple + border pulse on press (via `PressableScale` parent). Default: same as `glow`. */
  pressGlow?: boolean
  sharedTransitionTag?: SharedTransitionTag
}

const variantStyles: Record<GameCardVariant, string> = {
  default: 'border-border bg-surface',
  hero: 'border-primary/40 bg-surface-elevated',
  quest: 'border-accent/30 bg-surface-elevated',
  reward: 'border-gold/35 bg-gold/5',
  danger: 'border-danger/35 bg-danger/5',
}

const renderCardBody = (
  variant: GameCardVariant,
  pressGlow: boolean,
  cardClassName: string,
  cardStyle: ViewProps['style'],
  children: ReactNode,
  props: Omit<ViewProps, 'style' | 'children'>,
) => (
  <View className={cn(cardClassName, pressGlow && 'overflow-hidden')} style={cardStyle} {...props}>
    {pressGlow ? <GameCardPressGlow variant={variant} /> : null}
    {children}
  </View>
)

export const GameCard = ({
  children,
  variant = 'default',
  className,
  glow = false,
  pressGlow,
  sharedTransitionTag,
  style,
  ...props
}: GameCardProps) => {
  const showPressGlow = pressGlow ?? glow

  const glowStyle =
    glow && Platform.OS === 'android'
      ? {
          borderWidth: 1.5,
          borderColor:
            variant === 'reward' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(139, 92, 246, 0.45)',
        }
      : glow
        ? {
            shadowColor: variant === 'reward' ? '#fbbf24' : '#8b5cf6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 6,
          }
        : undefined

  const cardClassName = cn('rounded-game border p-5', variantStyles[variant], className)
  const cardStyle = [glowStyle, style]

  if (sharedTransitionTag && SHARED_ELEMENT_TRANSITIONS_ENABLED) {
    return (
      <Animated.View
        sharedTransitionTag={sharedTransitionTag}
        sharedTransitionStyle={heroCardSharedTransition}
        collapsable={false}
        className={cn(cardClassName, showPressGlow && 'overflow-hidden')}
        style={cardStyle}
        {...props}>
        {showPressGlow ? <GameCardPressGlow variant={variant} /> : null}
        {children}
      </Animated.View>
    )
  }

  return renderCardBody(variant, showPressGlow, cardClassName, cardStyle, children, props)
}
