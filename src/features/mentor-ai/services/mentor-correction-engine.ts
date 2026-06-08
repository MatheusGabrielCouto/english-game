import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import {
    MentorCorrectionCategory,
    type CorrectionResult,
    type MentorAIContext
} from '@/types/mentor-ai'

type CorrectionRule = {
  pattern: RegExp
  apply: (sentence: string, match: RegExpMatchArray) => Pick<
    CorrectionResult,
    'original' | 'corrected' | 'explanation' | 'explanationEn' | 'category' | 'practiceTip'
  >
}

const capitalizeFirst = (text: string): string =>
  text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1)

const CORRECTION_RULES: CorrectionRule[] = [
  {
    pattern: /\bi have (\d+) years old\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bi have (\d+) years old\b/i, 'I am $1 years old'),
      explanation: 'Em inglês usamos **to be** para idade, não *have*.',
      explanationEn: 'In English we use **to be** for age, not *have*.',
      category: MentorCorrectionCategory.GRAMMAR_AGREEMENT,
      practiceTip: 'Pratique: "I am 25 years old."',
    }),
  },
  {
    pattern: /\bi am agree\b/i,
    apply: (_, match) => ({
      original: match[0],
      corrected: 'I agree',
      explanation: '*Agree* já é verbo — não precisa de *am*.',
      explanationEn: '*Agree* is already a verb — you don\'t need *am*.',
      category: MentorCorrectionCategory.GRAMMAR_AGREEMENT,
    }),
  },
  {
    pattern: /\bmore (easy|simple|fast|cheap|big|small)\b/i,
    apply: (sentence, match) => {
      const map: Record<string, string> = {
        easy: 'easier',
        simple: 'simpler',
        fast: 'faster',
        cheap: 'cheaper',
        big: 'bigger',
        small: 'smaller',
      }
      const adj = match[1].toLowerCase()
      return {
        original: match[0],
        corrected: sentence.replace(match[0], map[adj] ?? match[0]),
        explanation: 'Adjetivos curtos formam comparativo com **-er**, não *more*.',
        explanationEn: 'Short adjectives form the comparative with **-er**, not *more*.',
        category: MentorCorrectionCategory.GRAMMAR_AGREEMENT,
      }
    },
  },
  {
    pattern: /\bsince (\d+) years\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bsince (\d+) years\b/i, 'for $1 years'),
      explanation: '**For** + período; **since** + ponto no tempo (*since 2022*).',
      explanationEn: 'Use **for** + a period; **since** + a point in time (*since 2022*).',
      category: MentorCorrectionCategory.PREPOSITION,
    }),
  },
  {
    pattern: /\bi want that you\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bi want that you\b/i, 'I want you to'),
      explanation: 'Depois de *want* usamos objeto + **to + verbo**, não *that you*.',
      explanationEn: 'After *want* use object + **to + verb**, not *that you*.',
      category: MentorCorrectionCategory.WORD_ORDER,
    }),
  },
  {
    pattern: /\binformations\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\binformations\b/i, 'information'),
      explanation: '*Information* é incontável — sem plural.',
      explanationEn: '*Information* is uncountable — it has no plural form.',
      category: MentorCorrectionCategory.VOCABULARY,
    }),
  },
  {
    pattern: /\bpeoples\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bpeoples\b/i, 'people'),
      explanation: '*People* já é plural; não use *peoples* no sentido geral.',
      explanationEn: '*People* is already plural; don\'t use *peoples* in a general sense.',
      category: MentorCorrectionCategory.VOCABULARY,
    }),
  },
  {
    pattern: /\bhe don't\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bhe don't\b/i, "he doesn't"),
      explanation: 'Com *he/she/it* no Present Simple usamos **doesn\'t**.',
      explanationEn: 'With *he/she/it* in the Present Simple we use **doesn\'t**.',
      category: MentorCorrectionCategory.GRAMMAR_AGREEMENT,
    }),
  },
  {
    pattern: /\bshe don't\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bshe don't\b/i, "she doesn't"),
      explanation: 'Com *he/she/it* no Present Simple usamos **doesn\'t**.',
      explanationEn: 'With *he/she/it* in the Present Simple we use **doesn\'t**.',
      category: MentorCorrectionCategory.GRAMMAR_AGREEMENT,
    }),
  },
  {
    pattern: /\bdidn't went\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bdidn't went\b/i, "didn't go"),
      explanation: 'Após *didn\'t* use o verbo no **infinitivo** (go), não no passado.',
      explanationEn: 'After *didn\'t* use the **base verb** (go), not the past form.',
      category: MentorCorrectionCategory.GRAMMAR_TENSE,
    }),
  },
  {
    pattern: /\bhave been to there\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bhave been to there\b/i, 'have been there'),
      explanation: 'Com *there* não usamos preposição *to*.',
      explanationEn: 'With *there* we don\'t use the preposition *to*.',
      category: MentorCorrectionCategory.PREPOSITION,
    }),
  },
  {
    pattern: /\bdepends? of\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bdepends? of\b/i, (value) =>
        value.toLowerCase().startsWith('depends') ? 'depends on' : 'depend on',
      ),
      explanation: 'O verbo *depend* combina com **on**, não *of*.',
      explanationEn: 'The verb *depend* goes with **on**, not *of*.',
      category: MentorCorrectionCategory.COLLOCATION,
    }),
  },
  {
    pattern: /\bexplain me\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bexplain me\b/i, 'explain to me'),
      explanation: 'Em inglês dizemos **explain to someone**, não *explain me*.',
      explanationEn: 'In English we say **explain to someone**, not *explain me*.',
      category: MentorCorrectionCategory.WORD_ORDER,
    }),
  },
  {
    pattern: /\bthinking to\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bthinking to\b/i, 'thinking of'),
      explanation: '*Think of + -ing* expressa considerar uma ação.',
      explanationEn: 'Use *think of + -ing* to talk about considering an action.',
      category: MentorCorrectionCategory.PREPOSITION,
    }),
  },
  {
    pattern: /\bdiscuss about\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bdiscuss about\b/i, 'discuss'),
      explanation: '*Discuss* já carrega a ideia de "sobre" — não precisa de *about*.',
      explanationEn: '*Discuss* already includes the idea of "about" — no *about* needed.',
      category: MentorCorrectionCategory.COLLOCATION,
    }),
  },
  {
    pattern: /\bi am boring\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bi am boring\b/i, 'I am bored'),
      explanation: '*Bored* = você sente tédio; *boring* = algo que causa tédio.',
      explanationEn: '*Bored* = you feel boredom; *boring* = something that causes boredom.',
      category: MentorCorrectionCategory.VOCABULARY,
    }),
  },
  {
    pattern: /\bloose weight\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bloose weight\b/i, 'lose weight'),
      explanation: '*Lose* = perder; *loose* = solto.',
      explanationEn: '*Lose* = to misplace or not win; *loose* = not tight.',
      category: MentorCorrectionCategory.VOCABULARY,
    }),
  },
  {
    pattern: /\bi have a doubt\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bi have a doubt\b/i, 'I have a question'),
      explanation: 'Calque do português — em inglês use **I have a question**.',
      explanationEn: 'A calque from Portuguese — in English use **I have a question**.',
      category: MentorCorrectionCategory.COLLOCATION,
    }),
  },
  {
    pattern: /\bhow many time\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bhow many time\b/i, 'how much time'),
      explanation: 'Tempo não contável → **how much time** ou *how long*.',
      explanationEn: 'Time is uncountable → **how much time** or *how long*.',
      category: MentorCorrectionCategory.GRAMMAR_AGREEMENT,
    }),
  },
  {
    pattern: /\bin the night\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bin the night\b/i, 'at night'),
      explanation: 'Para "à noite" usamos **at night**.',
      explanationEn: 'For "at night" we use **at night**.',
      category: MentorCorrectionCategory.PREPOSITION,
    }),
  },
  {
    pattern: /\bon the past\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bon the past\b/i, 'in the past'),
      explanation: 'Para períodos passados usamos **in the past**.',
      explanationEn: 'For past periods we use **in the past**.',
      category: MentorCorrectionCategory.PREPOSITION,
    }),
  },
  {
    pattern: /\ba honest\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\ba honest\b/i, 'an honest'),
      explanation: 'Antes de som de vogal usamos **an**, não *a*.',
      explanationEn: 'Before a vowel sound we use **an**, not *a*.',
      category: MentorCorrectionCategory.ARTICLE,
    }),
  },
  {
    pattern: /\bcan to\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bcan to\b/i, 'can'),
      explanation: 'Modal verbs (*can, will, must*) não levam *to* antes do verbo principal.',
      explanationEn: 'Modal verbs (*can, will, must*) don\'t take *to* before the main verb.',
      category: MentorCorrectionCategory.GRAMMAR_TENSE,
    }),
  },
  {
    pattern: /\bwill to\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\bwill to\b/i, 'will'),
      explanation: '*Will* já marca o futuro — não use *will to go*, use *will go*.',
      explanationEn: '*Will* already marks the future — use *will go*, not *will to go*.',
      category: MentorCorrectionCategory.GRAMMAR_TENSE,
    }),
  },
  {
    pattern: /\b(?:make|made) a decision of\b/i,
    apply: (sentence, match) => ({
      original: match[0],
      corrected: sentence.replace(/\b(?:make|made) a decision of\b/i, (value) =>
        value.toLowerCase().startsWith('made') ? 'made a decision about' : 'make a decision about',
      ),
      explanation: 'Decisões são **about** um tema, não *of*.',
      explanationEn: 'Decisions are **about** a topic, not *of*.',
      category: MentorCorrectionCategory.COLLOCATION,
    }),
  },
]

const withSkillNote = (
  result: Pick<
    CorrectionResult,
    'original' | 'corrected' | 'explanation' | 'explanationEn' | 'category' | 'practiceTip'
  >,
  context: MentorAIContext,
  sentence: string,
): CorrectionResult => {
  const weakest = LEARNING_SKILL_BY_KEY[context.skills.weakest]
  const skillLabel = weakest.label.toLowerCase()
  const cefr = context.learningGps.worldCefr

  const explanation = [
    result.explanation,
    `Isso reforça sua **${skillLabel}** no nível ${cefr}.`,
  ].join(' ')

  const explanationEn = result.explanationEn
    ? [result.explanationEn, `This strengthens your **${skillLabel}** at level ${cefr}.`].join(' ')
    : undefined

  return {
    original: capitalizeFirst(result.original.trim()),
    corrected: capitalizeFirst(result.corrected.trim()),
    explanation,
    explanationEn,
    category: result.category,
    practiceTip: result.practiceTip,
  }
}

export const MentorCorrectionEngine = {
  tryCorrect(sentence: string, context: MentorAIContext): CorrectionResult | null {
    const trimmed = sentence.trim()
    if (!trimmed) return null

    for (const rule of CORRECTION_RULES) {
      const match = trimmed.match(rule.pattern)
      if (!match) continue
      return withSkillNote(rule.apply(trimmed, match), context, trimmed)
    }

    return null
  },

  ruleCount(): number {
    return CORRECTION_RULES.length
  },
}
