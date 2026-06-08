import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'
import type { MentorAIContext } from '@/types/mentor-ai'

import { formatCorrectionResult } from '../utils/format-correction-result'
import { MentorCorrectionEngine } from './mentor-correction-engine'
import { isTranslationRequest, MentorTranslationEngine } from './mentor-translation-engine'

type PedagogyMatch = {
  response: string
  topic?: string
}

const normalize = (text: string): string => text.trim().toLowerCase()

const extractQuotedText = (text: string): string | null => {
  const match = text.match(/"([^"]+)"|'([^']+)'|:\s*(.+)$/i)
  if (!match) return null
  return (match[1] ?? match[2] ?? match[3])?.trim() ?? null
}

const buildContextIntro = (context: MentorAIContext): string => {
  const weakest = LEARNING_SKILL_BY_KEY[context.skills.weakest]
  return `No mundo **${context.learningGps.currentWorld}** (${context.learningGps.worldCefr}), sua skill mais fraca é **${weakest.label}** — vamos trabalhar nisso.`
}

const matchGrammarTopic = (text: string): PedagogyMatch | null => {
  const rules: { pattern: RegExp; response: string; topic: string }[] = [
    {
      pattern: /present\s+perfect/i,
      topic: 'present_perfect',
      response: [
        '**Present Perfect** liga passado e presente — foco no resultado, não no momento exato.',
        '',
        'Estrutura: **have/has + past participle**',
        '- I **have finished** my homework.',
        '- She **has lived** here for 3 years.',
        '',
        '💡 Dica: use com *for/since*, *already*, *yet*, *ever/never*.',
        '',
        'Mini quiz: complete → "I ___ (study) English for two years."',
        'Resposta: **have studied**',
      ].join('\n'),
    },
    {
      pattern: /past\s+simple/i,
      topic: 'past_simple',
      response: [
        '**Past Simple** descreve ações **finalizadas** em um tempo definido no passado.',
        '',
        'Estrutura: verbo no passado (regular: -ed / irregular: 2ª coluna)',
        '- I **worked** yesterday.',
        '- She **went** to London in 2022.',
        '',
        '💡 Dica: palavras-gatilho — *yesterday, last week, ago, in 2019*.',
        '',
        'Mini quiz: "They ___ (not / finish) the report last night."',
        'Resposta: **did not finish**',
      ].join('\n'),
    },
    {
      pattern: /present\s+continuous|present\s+progressive/i,
      topic: 'present_continuous',
      response: [
        '**Present Continuous** = ação **em progresso agora** ou temporária.',
        '',
        'Estrutura: **am/is/are + verb-ing**',
        '- I **am studying** right now.',
        '- She **is working** remotely this month.',
        '',
        '💡 Dica: *now, at the moment, currently* são sinais claros.',
      ].join('\n'),
    },
    {
      pattern: /future|will vs going to|going to/i,
      topic: 'future',
      response: [
        '**Futuro em inglês** — duas formas principais:',
        '',
        '1. **will** → decisão espontânea / previsão',
        '   - I **will help** you.',
        '2. **going to** → plano / evidência',
        '   - I **am going to study** tonight.',
        '',
        '💡 Dica: planos fixos → *going to*; promessas rápidas → *will*.',
      ].join('\n'),
    },
    {
      pattern: /articles|a\/an\/the|artigos/i,
      topic: 'articles',
      response: [
        '**Artigos em inglês:**',
        '- **a/an** → algo não específico (an antes de vogal)',
        '- **the** → algo específico ou único',
        '- **∅** (zero article) → plural genérico ou conceitos',
        '',
        'Exemplos:',
        '- I need **a** pen. (qualquer caneta)',
        '- **The** pen on the desk is mine. (específica)',
        '- **Cats** are curious. (gatos em geral)',
      ].join('\n'),
    },
  ]

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      return { response: rule.response, topic: rule.topic }
    }
  }

  return null
}

const matchVocabulary = (text: string): PedagogyMatch | null => {
  const patterns = [
    /what does (.+?) mean/i,
    /o que significa (.+?)[\?\.]?$/i,
    /significado de (.+?)[\?\.]?$/i,
    /explain (.+?)[\?\.]?$/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    const term = match?.[1]?.trim()
    if (!term || term.length > 60) continue

    const vocabulary: Record<string, string> = {
      although: [
        '**although** = embora / mesmo que (concessão)',
        '',
        '- **Although** it was late, we kept studying.',
        '- She passed, **although** she was nervous.',
        '',
        '💡 Não confunda com *however* (início de frase com ponto e vírgula).',
      ].join('\n'),
      however: [
        '**however** = porém / contudo',
        '',
        '- The task was hard; **however**, we finished it.',
        '',
        '💡 *Although* entra na mesma frase; *however* costuma ligar duas frases.',
      ].join('\n'),
      leverage: [
        '**leverage** (verbo) = aproveitar / usar como alavanca',
        '',
        '- We **leverage** automation to ship faster.',
        '- **Leverage** your English in international teams.',
      ].join('\n'),
      although_default: '',
    }

    const key = normalize(term)
    const known = vocabulary[key]
    if (known) {
      return { response: known, topic: `vocab_${key}` }
    }

    return {
      response: [
        `**${term}** — palavra útil no seu nível atual.`,
        '',
        'Sugestão de estudo:',
        `1. Busque "${term}" em um exemplo técnico (docs, PR, meeting).`,
        `2. Escreva 2 frases suas usando "${term}".`,
        `3. Salve como flashcard no Baralho Vivo.`,
        '',
        '💡 Quer que eu gere frases de exemplo no contexto de tecnologia?',
      ].join('\n'),
      topic: `vocab_${key}`,
    }
  }

  return null
}

const matchTranslation = (text: string): PedagogyMatch | null => {
  const response = MentorTranslationEngine.tryTranslate(text)
  if (!response) return null

  return { response, topic: 'translation' }
}

const matchCorrection = (text: string, context: MentorAIContext): PedagogyMatch | null => {
  if (isTranslationRequest(text)) return null

  const wantsCorrection =
    /correct|corrig|fix this|is this right|está certo/i.test(text) ||
    extractQuotedText(text) !== null

  const sentence = extractQuotedText(text) ?? text
  const offline = MentorCorrectionEngine.tryCorrect(sentence, context)

  if (offline) {
    return {
      response: formatCorrectionResult(offline),
      topic: 'correction',
    }
  }

  if (wantsCorrection) {
    return {
      response: [
        'Envie a frase entre aspas para eu corrigir com ❌ ✅ 💡.',
        'Exemplo: Correct this: "I have 30 years old"',
      ].join('\n'),
      topic: 'correction_help',
    }
  }

  return null
}

const buildGenericResponse = (context: MentorAIContext, userMessage: string): PedagogyMatch => {
  const weakest = LEARNING_SKILL_BY_KEY[context.skills.weakest]
  const preview = userMessage.trim().slice(0, 100)

  return {
    response: [
      buildContextIntro(context),
      '',
      `Sobre **"${preview}${userMessage.length > 100 ? '…' : ''}"** — vamos em inglês:`,
      '',
      '1. **Traduza** — me diga *"como se fala …"* que eu monto a frase em inglês.',
      '2. **Corrija** — envie sua frase em inglês que eu corrijo com ❌ ✅ 💡.',
      `3. **Pratique** — 5 min de **${weakest.label}** hoje.`,
      '',
      '🇬🇧 Exemplo: *How do you say "hoje eu vou buscar minha esposa"?*',
      '',
      context.player.streak > 0
        ? `🔥 ${context.player.streak} dias de sequência — keep going!`
        : '💡 Estude 10 min hoje para iniciar sua sequência.',
    ].join('\n'),
    topic: 'general',
  }
}

export const MentorPedagogyEngine = {
  generate(context: MentorAIContext, userMessage: string): PedagogyMatch {
    const text = userMessage.trim()
    if (!text) {
      return {
        response: 'Pergunte sobre gramática, vocabulário ou envie uma frase para corrigir.',
      }
    }

    return (
      matchTranslation(text) ??
      matchCorrection(text, context) ??
      matchGrammarTopic(text) ??
      matchVocabulary(text) ??
      buildGenericResponse(context, text)
    )
  },
}
