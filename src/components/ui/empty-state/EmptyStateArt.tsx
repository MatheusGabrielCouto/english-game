import { EmptyStateIllustrationFrame } from './EmptyStateIllustrationFrame'
import { FarmEmptyIllustration } from './illustrations/FarmEmptyIllustration'
import { GameEmptyIllustration } from './illustrations/GameEmptyIllustration'
import { VaultEmptyIllustration } from './illustrations/VaultEmptyIllustration'

type EmptyStateArtVariant = 'game' | 'vault' | 'farm'

type EmptyStateArtProps = {
  variant: EmptyStateArtVariant
  size?: number
}

const ILLUSTRATIONS = {
  game: GameEmptyIllustration,
  vault: VaultEmptyIllustration,
  farm: FarmEmptyIllustration,
} as const

export const EmptyStateArt = ({ variant, size }: EmptyStateArtProps) => {
  const Illustration = ILLUSTRATIONS[variant]

  return (
    <EmptyStateIllustrationFrame size={size}>
      <Illustration />
    </EmptyStateIllustrationFrame>
  )
}
