import { type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'

import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { cn } from '@/utils'

type HomeCardRowProps = ViewProps & {
  children: ReactNode
  align?: 'start' | 'center'
}

export const HomeCardRow = ({
  children,
  className,
  align = 'start',
  ...props
}: HomeCardRowProps) => (
  <View
    className={cn(
      align === 'center' ? HOME_LAYOUT.rowWrapCenter : HOME_LAYOUT.rowWrap,
      className,
    )}
    {...props}
  >
    {children}
  </View>
)
