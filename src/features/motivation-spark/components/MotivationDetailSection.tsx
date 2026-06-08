import { type ReactNode } from 'react'
import { Text, View } from 'react-native'

import { cn } from '@/utils'

type MotivationDetailSectionProps = {
  label: string
  children: ReactNode
  className?: string
}

export const MotivationDetailSection = ({
  label,
  children,
  className,
}: MotivationDetailSectionProps) => (
  <View className={cn('gap-3', className)}>
    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-streak">
      {label}
    </Text>
    {children}
  </View>
)
