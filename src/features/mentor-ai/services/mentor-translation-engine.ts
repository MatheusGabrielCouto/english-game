type TranslationEntry = {
  english: string
  whyLines: string[]
  note?: string
  alternatives?: string[]
  practice?: string
}

const TRANSLATION_PATTERNS = [
  /como\s+(?:se\s+)?(?:fala|diz|escreve)\s+["'""]?(.+?)["'""]?\s*\??$/i,
  /como\s+(?:falar|dizer|escrever)\s+["'""]?(.+?)["'""]?\s*\??$/i,
  /how\s+do\s+you\s+say\s+["'""]?(.+?)["'""]?\s*(?:\s+in\s+(?:english|ingl[eê]s))?\s*\??$/i,
  /how\s+to\s+say\s+["'""]?(.+?)["'""]?\s*(?:\s+in\s+(?:english|ingl[eê]s))?\s*\??$/i,
  /(?:traduz|translate)(?:a|ir|e)?\s+(?:para\s+ingl[eê]s\s+)?["'""]?(.+?)["'""]?\s*\??$/i,
  /(?:em\s+ingl[eê]s|in\s+english)[,:]?\s+["'""]?(.+?)["'""]?\s*\??$/i,
]

const PHRASE_TRANSLATIONS: Record<string, TranslationEntry> = {
  'hoje eu vou buscar minha esposa': {
    english: 'I am going to go get my wife today.',
    whyLines: [
      '**I am going to** = "eu vou" — usamos *going to* para planos e intenções futuras',
      '**go get** = "ir buscar" — o verbo *get* aqui significa pegar/buscar alguém, não "obter"',
      '**my wife** = "minha esposa" — possessivo antes do parentesco (*my*, não *the*)',
      '**today** = "hoje" — o tempo costuma ir no final da frase em inglês',
    ],
    note:
      'Nativos também dizem **"I\'m going to pick up my wife today"** — *pick up* é ainda mais natural quando você busca alguém no carro. Evite *search my wife* (*search* = procurar algo perdido).',
    alternatives: ["I'm going to pick up my wife today.", "I'll go get my wife later."],
    practice: "I'll pick you up at 7 pm.",
  },
  'bom dia': {
    english: 'Good morning.',
    whyLines: [
      '**Good** = "bom" — adjetivo antes do substantivo',
      '**morning** = "dia/manhã" — saudação padrão até o meio da manhã',
    ],
    practice: 'Good morning! How are you?',
  },
  'boa noite': {
    english: 'Good evening.',
    whyLines: [
      '**Good evening** = ao chegar à noite (tipo "boa noite" de chegada)',
      'Para despedir à noite, use **Good night**',
    ],
    practice: 'Good evening, everyone.',
  },
  'obrigado': {
    english: 'Thank you.',
    whyLines: [
      '**Thank you** = forma padrão e educada',
      'Informal: **Thanks** — mesma ideia, tom mais leve',
    ],
    practice: 'Thank you for your help!',
  },
  'como vai você': {
    english: 'How are you?',
    whyLines: [
      '**How are you** = pergunta mais comum no dia a dia',
      'A ordem é invertida: verbo (*are*) antes do sujeito (*you*)',
    ],
    alternatives: ["How's it going?", 'How are you doing?'],
    practice: "Hey! How are you doing today?",
  },
  'eu estou com fome': {
    english: "I'm hungry.",
    whyLines: [
      '**I\'m hungry** = literalmente "eu estou com fome"',
      'Use o adjetivo **hungry**, não o substantivo *hunger* nesta estrutura',
    ],
    practice: "I'm hungry. Let's grab lunch.",
  },
  'eu preciso de ajuda': {
    english: 'I need help.',
    whyLines: [
      '**I need** = "eu preciso" — o verbo *need* já carrega a necessidade',
      'Não use preposição extra: *I need help* (não *I need of help*)',
    ],
    practice: 'I need help with this task.',
  },
}

const normalizePhrase = (phrase: string): string =>
  phrase
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')

export const isTranslationRequest = (text: string): boolean =>
  TRANSLATION_PATTERNS.some((pattern) => pattern.test(text.trim().replace(/\?+$/g, '').trim())) ||
  /como\s+(?:se\s+)?(?:fala|diz)|how\s+do\s+you\s+say|how\s+to\s+say|traduz|translate|em\s+ingl[eê]s/i.test(
    text.trim(),
  )

export const extractTranslationPhrase = (text: string): string | null => {
  const trimmed = text.trim().replace(/\?+$/g, '').trim()

  for (const pattern of TRANSLATION_PATTERNS) {
    const match = trimmed.match(pattern)
    const phrase = match?.[1]?.trim().replace(/^["']|["']$/g, '')
    if (phrase) return phrase
  }

  if (!isTranslationRequest(trimmed)) return null

  const quoted = trimmed.match(/"([^"]+)"|'([^']+)'/)
  return quoted?.[1] ?? quoted?.[2] ?? null
}

const formatDidactic = (entry: TranslationEntry): string => {
  const lines = [`Em inglês é: **"${entry.english}"**`, '', '**Por quê assim?**']

  for (const line of entry.whyLines) {
    lines.push(`• ${line}`)
  }

  if (entry.note) {
    lines.push('', `💡 ${entry.note}`)
  }

  if (entry.alternatives?.length) {
    lines.push('', '**Outras formas naturais:**')
    for (const alt of entry.alternatives) {
      lines.push(`• ${alt}`)
    }
  }

  if (entry.practice) {
    lines.push('', `📝 **Pratique:** *${entry.practice}*`)
  }

  return lines.join('\n')
}

const buildGenericTranslationResponse = (phrase: string): string => {
  const lower = normalizePhrase(phrase)

  if (/vou buscar|vou pegar/.test(lower) && /esposa|marido|filho|filha|mãe|pai|namorad/.test(lower)) {
    const person = /esposa/.test(lower)
      ? 'my wife'
      : /marido/.test(lower)
        ? 'my husband'
        : /filho/.test(lower)
          ? 'my son'
          : /filha/.test(lower)
            ? 'my daughter'
            : 'them'

    return formatDidactic({
      english: `I am going to go get ${person} today.`,
      whyLines: [
        '**I am going to** = "eu vou" — plano futuro com *going to*',
        '**go get** = "ir buscar" — *get* aqui significa pegar/buscar alguém',
        `**${person}** = parentesco com possessivo (*my*)`,
        '**today** = "hoje" — tempo no final da frase',
      ],
      note: `Também use **pick up ${person}** — soa mais natural ao buscar alguém no carro.`,
      practice: "I'll pick you up at the airport.",
    })
  }

  if (/vou|irei/.test(lower)) {
    return formatDidactic({
      english: "I'm going to…",
      whyLines: [
        '**I\'m going to** = "eu vou" — estrutura para planos',
        '**I will** = alternativa para decisões e promessas',
      ],
      note: 'Complete com o verbo em seguida: *I\'m going to study English tonight.*',
      practice: "I'm going to study English tonight.",
    })
  }

  return [
    `Para **"${phrase}"**, tente montar em inglês e eu corrijo:`,
    '',
    '1. Comece com **I\'m going to…** ou **I will…** para futuro',
    '2. Envie sua tentativa: *"I think it is: …"*',
    '3. Eu explico o porquê de cada palavra',
  ].join('\n')
}

export const MentorTranslationEngine = {
  tryTranslate(text: string): string | null {
    const phrase = extractTranslationPhrase(text)
    if (!phrase) return null

    const normalized = normalizePhrase(phrase)
    const known = PHRASE_TRANSLATIONS[normalized]
    if (known) return formatDidactic(known)

    return buildGenericTranslationResponse(phrase)
  },
}
