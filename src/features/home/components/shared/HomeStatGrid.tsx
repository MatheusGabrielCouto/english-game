import { type ReactNode } from 'react'
import { View } from 'react-native'

import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { cn } from '@/utils'

type HomeStatGridProps = {
  children: ReactNode
  className?: string
}

export const HomeStatGrid = ({ children, className }: HomeStatGridProps) => (
  <View className={cn(HOME_LAYOUT.rowWrap, className)}>{children}</View>
)
