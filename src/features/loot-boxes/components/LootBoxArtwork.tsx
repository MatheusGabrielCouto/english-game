import { View } from 'react-native'

import { AppImage } from '@/components/ui/AppImage'
import { IMAGE_ASSETS } from '@/constants/image-assets'
import { cn } from '@/utils'

type LootBoxArtworkProps = {
  size?: number
  /** Faded watermark behind emoji heroes */
  variant?: 'watermark' | 'hero'
  className?: string
}

export const LootBoxArtwork = ({
  size = 96,
  variant = 'watermark',
  className,
}: LootBoxArtworkProps) => (
  <View
    pointerEvents="none"
    className={cn('items-center justify-center', className)}
    style={{ width: size, height: size }}>
    <AppImage
      source={IMAGE_ASSETS.lootMark}
      surface="loot"
      recyclingKey="loot-box-artwork"
      contentFit="contain"
      style={{
        width: size,
        height: size,
        opacity: variant === 'watermark' ? 0.22 : 0.9,
      }}
      accessibilityLabel="Arte da loot box"
    />
  </View>
)
