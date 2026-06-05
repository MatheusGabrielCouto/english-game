import { View } from 'react-native'

import { AppImage } from '@/components/ui/AppImage'
import { IMAGE_ASSETS } from '@/constants/image-assets'
import { cn } from '@/utils'

type HeroBrandMarkProps = {
  size?: number
  className?: string
}

/** Subtle branded mark for hero cards (profile, loot stats). */
export const HeroBrandMark = ({ size = 56, className }: HeroBrandMarkProps) => (
  <View
    pointerEvents="none"
    className={cn('items-center justify-center', className)}
    style={{ width: size, height: size }}>
    <AppImage
      source={IMAGE_ASSETS.heroMark}
      surface="hero"
      recyclingKey="hero-brand-mark"
      contentFit="contain"
      style={{ width: size, height: size, opacity: 0.18 }}
      accessibilityLabel="Marca English Quest"
    />
  </View>
)
