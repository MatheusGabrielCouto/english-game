import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'

import { theme } from '@/constants'

const SIZE = 132

export const VaultEmptyIllustration = () => (
  <Svg width={SIZE} height={SIZE} viewBox="0 0 132 132" accessibilityLabel="">
    <Defs>
      <LinearGradient id="vaultGlow" x1="0.2" y1="0" x2="0.8" y2="1">
        <Stop offset="0" stopColor={theme.colors.accent} stopOpacity="0.28" />
        <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0.18" />
      </LinearGradient>
      <LinearGradient id="vaultCover" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#2a2240" />
        <Stop offset="1" stopColor="#151520" />
      </LinearGradient>
    </Defs>

    <Circle cx="66" cy="66" r="54" fill="url(#vaultGlow)" />
    <Path
      d="M38 34 H82 C88 34 92 38 92 44 V98 C92 104 88 108 82 108 H50 C44 108 40 104 40 98 V44 C40 38 44 34 50 34 Z"
      fill="url(#vaultCover)"
      stroke={theme.colors.primary}
      strokeWidth="2"
    />
    <Path
      d="M40 44 H92 V52 H40 Z"
      fill={theme.colors.primary}
      opacity="0.35"
    />
    <Rect x="48" y="60" width="36" height="4" rx="2" fill={theme.colors.accent} opacity="0.75" />
    <Rect x="48" y="70" width="30" height="3" rx="1.5" fill={theme.colors.foregroundSecondary} opacity="0.5" />
    <Rect x="48" y="78" width="34" height="3" rx="1.5" fill={theme.colors.foregroundSecondary} opacity="0.4" />
    <Rect x="48" y="86" width="26" height="3" rx="1.5" fill={theme.colors.foregroundSecondary} opacity="0.35" />

    <Circle cx="88" cy="88" r="16" fill={theme.colors.accent} opacity="0.2" />
    <Path
      d="M88 80 V96 M80 88 H96"
      stroke={theme.colors.accent}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
)
