import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'

import { theme } from '@/constants'

const SIZE = 132

export const GameEmptyIllustration = () => (
  <Svg width={SIZE} height={SIZE} viewBox="0 0 132 132" accessibilityLabel="">
    <Defs>
      <LinearGradient id="gameGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.35" />
        <Stop offset="1" stopColor={theme.colors.gold} stopOpacity="0.15" />
      </LinearGradient>
      <LinearGradient id="gameCard" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1f1f30" />
        <Stop offset="1" stopColor="#12121c" />
      </LinearGradient>
    </Defs>

    <Circle cx="66" cy="66" r="54" fill="url(#gameGlow)" />
    <Circle cx="66" cy="66" r="46" fill={theme.colors.surfaceElevated} opacity="0.9" />

    <Rect x="34" y="30" width="64" height="72" rx="14" fill="url(#gameCard)" stroke={theme.colors.primary} strokeWidth="2" />
    <Rect x="42" y="42" width="28" height="6" rx="3" fill={theme.colors.primary} opacity="0.85" />
    <Rect x="42" y="54" width="48" height="4" rx="2" fill={theme.colors.foregroundSecondary} opacity="0.55" />
    <Rect x="42" y="64" width="40" height="4" rx="2" fill={theme.colors.foregroundSecondary} opacity="0.4" />
    <Rect x="42" y="74" width="44" height="4" rx="2" fill={theme.colors.foregroundSecondary} opacity="0.35" />

    <Path
      d="M78 78 L96 62 L102 68 L84 84 Z"
      fill={theme.colors.gold}
      opacity="0.95"
    />
    <Circle cx="98" cy="58" r="10" fill={theme.colors.gold} opacity="0.25" />
    <Path
      d="M98 52 L100 58 L106 58 L101 62 L103 68 L98 64 L93 68 L95 62 L90 58 L96 58 Z"
      fill={theme.colors.gold}
    />
  </Svg>
)
