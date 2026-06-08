const MIN_GOAL_LENGTH = 10
const MAX_GOAL_LENGTH = 140

const PEDAGOGICAL_QUESTION =
  /\b(explain|what does|what is|how do|how to|correct this|como se fala|o que é|o que significa|qual a diferença|me explica|pode explicar|traduza|translate)\b/i

const LEARNING_INTENT =
  /\b(saber|entender|explicar|aprender sobre|aprender o que|saber como|saber o que|saber qual|perguntar|meaning of|difference between)\b/i

const GOAL_PATTERNS: RegExp[] = [
  /\b(?:quero|preciso|gostaria de)\s+([^.!?\n]{8,140})/i,
  /\b(?:meu objetivo|minha meta|meu foco)\s+(?:é|e|:)\s*([^.!?\n]{8,140})/i,
  /\b(?:pretendo|sonho em|busco|procuro)\s+([^.!?\n]{8,140})/i,
  /\b(?:estou estudando(?:\s+inglês)?\s+para)\s+([^.!?\n]{8,140})/i,
  /\b(?:my goal is|i want to|i need to|i'm trying to)\s+([^.!?\n]{8,140})/i,
]

const trimGoalFragment = (raw: string): string =>
  raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[,;]\s*(?:porque|porquê|but|mas|and|e)\b.*$/i, '')
    .replace(/\s+(?:porque|porquê|but|mas)\b.*$/i, '')
    .trim()

const capitalizeSentence = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const formatGoal = (trigger: string, fragment: string): string => {
  const cleaned = trimGoalFragment(fragment)
  if (!cleaned) return ''

  const lowerTrigger = trigger.toLowerCase()

  if (/^(?:meu objetivo|minha meta|meu foco)/i.test(lowerTrigger)) {
    return capitalizeSentence(cleaned)
  }

  if (/^(?:quero|preciso|gostaria de)/i.test(lowerTrigger)) {
    if (/^(?:quero|preciso|gostaria de)\b/i.test(cleaned)) {
      return capitalizeSentence(cleaned)
    }
    const verb = lowerTrigger.startsWith('preciso')
      ? 'Preciso'
      : lowerTrigger.startsWith('gostaria')
        ? 'Gostaria de'
        : 'Quero'
    return capitalizeSentence(`${verb} ${cleaned}`)
  }

  if (/^(?:pretendo|sonho em|busco|procuro)/i.test(lowerTrigger)) {
    const verb = lowerTrigger.startsWith('sonho')
      ? 'Sonho em'
      : lowerTrigger.startsWith('busco')
        ? 'Busco'
        : lowerTrigger.startsWith('procuro')
          ? 'Procuro'
          : 'Pretendo'
    return capitalizeSentence(`${verb} ${cleaned}`)
  }

  if (/^estou estudando/i.test(lowerTrigger)) {
    return capitalizeSentence(`Estudando inglês para ${cleaned}`)
  }

  if (/^(?:my goal is|i want to|i need to|i'm trying to)/i.test(lowerTrigger)) {
    if (/^i /i.test(cleaned)) return capitalizeSentence(cleaned)
    return capitalizeSentence(`I want to ${cleaned}`)
  }

  return capitalizeSentence(cleaned)
}

const isLearningQuestionIntent = (trigger: string, fragment: string): boolean => {
  const combined = `${trigger} ${fragment}`.toLowerCase()
  if (LEARNING_INTENT.test(combined)) return true
  if (/^(?:saber|entender|aprender sobre|aprender o que)\b/i.test(fragment.trim())) return true
  return false
}

const isValidGoal = (goal: string): boolean => {
  if (goal.length < MIN_GOAL_LENGTH || goal.length > MAX_GOAL_LENGTH) return false
  if (PEDAGOGICAL_QUESTION.test(goal)) return false
  return true
}

export const extractGoalsFromMessage = (message: string): string[] => {
  const text = message.trim()
  if (!text || PEDAGOGICAL_QUESTION.test(text)) return []

  const goals: string[] = []

  for (const pattern of GOAL_PATTERNS) {
    const match = pattern.exec(text)
    if (!match) continue

    const trigger = match[0].slice(0, match[0].indexOf(match[1])).trim()
    const fragment = match[1]

    if (isLearningQuestionIntent(trigger, fragment)) continue

    const goal = formatGoal(trigger, fragment)
    if (!isValidGoal(goal)) continue

    const normalized = goal.toLowerCase()
    if (goals.some((existing) => existing.toLowerCase() === normalized)) continue

    goals.push(goal)
  }

  return goals
}
