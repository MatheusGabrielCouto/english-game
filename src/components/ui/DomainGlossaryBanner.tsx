import { Text, View } from 'react-native'

import {
  DOMAIN_GLOSSARY_BANNERS,
  type DomainGlossaryBannerVariant,
} from '@/constants/domain-glossary'

type DomainGlossaryBannerProps = {
  variant: DomainGlossaryBannerVariant
}

export const DomainGlossaryBanner = ({ variant }: DomainGlossaryBannerProps) => {
  const copy = DOMAIN_GLOSSARY_BANNERS[variant]

  return (
    <View
      className="rounded-xl border border-border/80 bg-surface px-3 py-2.5"
      accessibilityRole="text"
      accessibilityLabel={`${copy.title}. ${copy.body}`}>
      <Text className="text-xs font-bold text-foreground-secondary">{copy.title}</Text>
      <Text className="mt-1 text-xs leading-relaxed text-muted">{copy.body}</Text>
    </View>
  )
}
