import type { CorrectionResult } from '@/types/mentor-ai'

export const formatCorrectionResult = (result: CorrectionResult): string => {
  const lines = [`❌ ${result.original}`, `✅ ${result.corrected}`]

  if (result.explanationEn) {
    lines.push(`🇬🇧 ${result.explanationEn}`)
    lines.push(`🇧🇷 ${result.explanation}`)
  } else {
    lines.push(`💡 ${result.explanation}`)
  }

  if (result.practiceTip) {
    lines.push(`📝 ${result.practiceTip}`)
  }

  return lines.join('\n')
}
