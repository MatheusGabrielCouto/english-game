import { StatPill, type StatPillProps } from '@/components/ui/game'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { cn } from '@/utils'

type HomeStatPillProps = StatPillProps & {
  fullWidth?: boolean
}

export const HomeStatPill = ({ className, fullWidth, ...props }: HomeStatPillProps) => (
  <StatPill
    layout="tile"
    {...props}
    className={cn(
      HOME_LAYOUT.statTileWidth,
      HOME_LAYOUT.statTileMin,
      fullWidth && 'w-full max-w-full',
      className,
    )}
  />
)
