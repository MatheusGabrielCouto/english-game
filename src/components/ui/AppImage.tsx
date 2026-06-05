import { Image, type ImageProps } from 'expo-image'
import { type StyleProp, type ImageStyle } from 'react-native'

import {
  IMAGE_BLURHASH,
  IMAGE_CACHE_POLICY,
  IMAGE_TRANSITION_MS,
  type ImageSurface,
} from '@/constants/image-ui'
import { cn } from '@/utils'

export type AppImageProps = Omit<ImageProps, 'placeholder' | 'transition'> & {
  surface?: ImageSurface
  blurhash?: string
  className?: string
  recyclingKey?: string
}

export const AppImage = ({
  surface = 'default',
  blurhash,
  className,
  style,
  cachePolicy = IMAGE_CACHE_POLICY,
  transition = IMAGE_TRANSITION_MS,
  recyclingKey,
  ...props
}: AppImageProps) => {
  const placeholder = blurhash ?? IMAGE_BLURHASH[surface]

  return (
    <Image
      {...props}
      className={cn(className)}
      style={style as StyleProp<ImageStyle>}
      cachePolicy={cachePolicy}
      transition={transition}
      placeholder={{ blurhash: placeholder }}
      recyclingKey={recyclingKey}
    />
  )
}
