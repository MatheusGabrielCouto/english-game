const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

const channelLuminance = (channel: number) => {
  const s = channel / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  )
}

/** WCAG 2.1 contrast ratio between two sRGB hex colors. */
export const contrastRatio = (foreground: string, background: string): number => {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export const meetsWcagAaNormalText = (foreground: string, background: string): boolean =>
  contrastRatio(foreground, background) >= WCAG_AA_NORMAL_TEXT

export const WCAG_AA_NORMAL_TEXT = 4.5

export const WCAG_AA_LARGE_TEXT = 3
