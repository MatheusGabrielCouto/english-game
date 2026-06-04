export type CollectionTemplate = {
  key: string
  name: string
  emoji: string
  description: string
}

export const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    key: 'ielts',
    name: 'IELTS',
    emoji: '🎯',
    description: 'Preparação e notas para o exame',
  },
  {
    key: 'interview',
    name: 'Entrevistas',
    emoji: '💼',
    description: 'Perguntas, respostas e feedback',
  },
  {
    key: 'course',
    name: 'Curso de inglês',
    emoji: '🏫',
    description: 'Aulas, lições e tarefas',
  },
  {
    key: 'speaking',
    name: 'Speaking',
    emoji: '🎤',
    description: 'Pronúncia, frases e prática oral',
  },
  {
    key: 'vocabulary',
    name: 'Vocabulário',
    emoji: '📝',
    description: 'Palavras e expressões novas',
  },
]

export const COLLECTION_TEMPLATE_BY_KEY = Object.fromEntries(
  COLLECTION_TEMPLATES.map((t) => [t.key, t]),
) as Record<string, CollectionTemplate>
