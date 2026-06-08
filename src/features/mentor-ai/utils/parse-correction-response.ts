import {
  MentorCorrectionCategory,
  type CorrectionResult,
  type MentorCorrectionCategoryValue,
} from '@/types/mentor-ai'

const STRICT_PATTERNS = {
  wrong: /❌\s*(.+)/i,
  right: /✅\s*(.+)/i,
  tip: /💡\s*(.+)/i,
  tipEn: /🇬🇧\s*(.+)/i,
  tipPt: /🇧🇷\s*(.+)/i,
  practice: /📝\s*(.+)/i,
}

const LENIENT_PATTERNS = {
  wrong:
    /(?:❌|wrong|original|errado|incorrect|como você escreveu)\s*[:\-]?\s*(.+)/i,
  right:
    /(?:✅|correct(?:ed)?|corrigido|correto|forma correta|right)\s*[:\-]?\s*(.+)/i,
  tip: /(?:💡|tip|dica|explanation|explicação|por que|because)\s*[:\-]?\s*(.+)/i,
  tipEn: /(?:🇬🇧|🇺🇸|english|inglês)\s*[:\-]?\s*(.+)/i,
  tipPt: /(?:🇧🇷|portuguese|portugu[eê]s)\s*[:\-]?\s*(.+)/i,
  practice: /(?:📝|practice|prática|pratique)\s*[:\-]?\s*(.+)/i,
}

const stripMarkdown = (text: string): string =>
  text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim()

const firstMatch = (text: string, pattern: RegExp): string | null => {
  const match = text.match(pattern)
  return match?.[1] ? stripMarkdown(match[1]) : null
}

const stripLinePrefix = (line: string): string =>
  stripMarkdown(
    line
      .replace(
        /^(?:❌|✅|💡|📝|🇬🇧|🇺🇸|🇧🇷|wrong|correct(?:ed)?|original|errado|correto|tip|dica|explanation|explicação|english|inglês|portuguese|portugu[eê]s)\s*[:\-]?\s*/i,
        '',
      )
      .trim(),
  )

const inferCategory = (explanation: string, original: string): MentorCorrectionCategoryValue => {
  const haystack = `${explanation} ${original}`.toLowerCase()

  if (/tense|past|present|future|participle|went|didn't|haven't/.test(haystack)) {
    return MentorCorrectionCategory.GRAMMAR_TENSE
  }
  if (/preposition|for\b|since\b|at night|in the past|depend on/.test(haystack)) {
    return MentorCorrectionCategory.PREPOSITION
  }
  if (/article|a\/an|an honest/.test(haystack)) {
    return MentorCorrectionCategory.ARTICLE
  }
  if (/collocation|calque|doubt|discuss about/.test(haystack)) {
    return MentorCorrectionCategory.COLLOCATION
  }
  if (/word order|that you|to me/.test(haystack)) {
    return MentorCorrectionCategory.WORD_ORDER
  }
  if (/vocabulary|spelling|bored|lose|information|people/.test(haystack)) {
    return MentorCorrectionCategory.VOCABULARY
  }
  if (/agree|doesn't|don't|comparative|-er\b|more easy/.test(haystack)) {
    return MentorCorrectionCategory.GRAMMAR_AGREEMENT
  }

  return MentorCorrectionCategory.OTHER
}

const buildResult = (
  text: string,
  original: string,
  corrected: string,
  explanation: string,
  options?: { explanationEn?: string; practiceTip?: string },
): CorrectionResult => ({
  original,
  corrected,
  explanation,
  explanationEn: options?.explanationEn,
  category: inferCategory(`${explanation} ${options?.explanationEn ?? ''}`, original),
  practiceTip: options?.practiceTip,
  raw: text,
})

const parseWithPatterns = (
  text: string,
  fallbackOriginal: string,
  patterns: typeof STRICT_PATTERNS,
): CorrectionResult | null => {
  const original = firstMatch(text, patterns.wrong) ?? fallbackOriginal.trim()
  const corrected = firstMatch(text, patterns.right)
  const practiceTip = firstMatch(text, patterns.practice) ?? undefined

  const explanationPt = firstMatch(text, patterns.tipPt) ?? firstMatch(text, patterns.tip)
  const explanationEn = firstMatch(text, patterns.tipEn)
  const explanation = explanationPt ?? explanationEn

  if (!corrected || !explanation) return null

  return buildResult(text, original, corrected, explanation, {
    explanationEn: explanationPt && explanationEn ? explanationEn : undefined,
    practiceTip,
  })
}

const parseArrowFormat = (text: string, fallbackOriginal: string): CorrectionResult | null => {
  const match = text.match(
    /(?:❌\s*)?(.+?)\s*(?:→|->|=>)\s*(.+?)(?:\n|$)/,
  )
  if (!match?.[1] || !match[2]) return null

  const original = stripMarkdown(match[1])
  const corrected = stripMarkdown(match[2])
  const explanationEn = firstMatch(text, STRICT_PATTERNS.tipEn) ?? firstMatch(text, LENIENT_PATTERNS.tipEn)
  const explanationPt =
    firstMatch(text, STRICT_PATTERNS.tipPt) ??
    firstMatch(text, LENIENT_PATTERNS.tipPt) ??
    firstMatch(text, STRICT_PATTERNS.tip) ??
    firstMatch(text, LENIENT_PATTERNS.tip)

  const explanation =
    explanationPt ??
    explanationEn ??
    text
      .split('\n')
      .map((line) => stripLinePrefix(line.trim()))
      .find((line) => line && line !== original && line !== corrected)

  if (!corrected || !explanation) return null

  return buildResult(text, original || fallbackOriginal.trim(), corrected, explanation, {
    explanationEn: explanationPt && explanationEn ? explanationEn : undefined,
  })
}

const parseLineHeuristic = (text: string, fallbackOriginal: string): CorrectionResult | null => {
  const lines = text
    .split('\n')
    .map((line) => stripLinePrefix(line.trim()))
    .filter(Boolean)

  if (lines.length < 3) return null

  const [first, second, ...rest] = lines
  const explanation = rest.join(' ').trim()
  if (!first || !second || !explanation) return null

  return buildResult(text, first, second, explanation)
}

export const parseCorrectionResponse = (
  raw: string,
  fallbackOriginal: string,
): CorrectionResult | null => {
  const text = raw.trim()
  if (!text) return null

  return (
    parseWithPatterns(text, fallbackOriginal, STRICT_PATTERNS) ??
    parseWithPatterns(text, fallbackOriginal, LENIENT_PATTERNS) ??
    parseArrowFormat(text, fallbackOriginal) ??
    parseLineHeuristic(text, fallbackOriginal)
  )
}

export const buildUnstructuredCorrectionResult = (
  sentence: string,
  raw: string,
): CorrectionResult => {
  const text = raw.trim()
  const parsed =
    parseCorrectionResponse(text, sentence) ??
    parseArrowFormat(text, sentence) ??
    parseLineHeuristic(text, sentence)

  if (parsed) return parsed

  const arrowMatch = text.match(/(.+?)\s*(?:→|->|=>)\s*(.+)/)
  const corrected = arrowMatch?.[2] ? stripMarkdown(arrowMatch[2]) : sentence

  return {
    original: sentence.trim(),
    corrected,
    explanation: text,
    category: MentorCorrectionCategory.OTHER,
    raw: text,
  }
}
