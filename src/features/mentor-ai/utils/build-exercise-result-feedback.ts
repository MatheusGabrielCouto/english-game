import type {
  MentorExerciseAnswerRecord,
  MentorExerciseResultFeedback,
  MentorExerciseSet,
} from '@/types/mentor-ai'

export const buildExerciseResultFeedback = (
  exerciseSet: MentorExerciseSet,
  answers: MentorExerciseAnswerRecord[],
): MentorExerciseResultFeedback => {
  const total = exerciseSet.questions.length
  const wrong = answers.filter((answer) => !answer.isCorrect)
  const correctCount = answers.filter((answer) => answer.isCorrect).length
  const scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0

  if (wrong.length === 0) {
    return {
      summary: `Excelente! Você acertou todas as ${total} perguntas sobre ${exerciseSet.title}.`,
      weaknesses: [],
      improvements: [
        `Pratique ${exerciseSet.title} em frases suas — escreva 3 exemplos no diário.`,
        'Tente um tema mais difícil ou aumente a velocidade de resposta.',
        'Revise as cartas do Baralho Vivo sobre este tópico para fixar.',
      ],
    }
  }

  const weaknesses = wrong.map(
    (answer) =>
      `Pergunta ${answer.questionIndex + 1}: você escolheu "${answer.selectedOption}", mas o correto é "${answer.correctOption}". ${answer.explanation}`,
  )

  const improvements = [
    `Revise ${exerciseSet.title} focando nos erros acima — refaça o quiz amanhã.`,
    'Leia cada explicação em voz alta e crie uma frase sua com a forma correta.',
    scorePct < 60
      ? 'Comece com exercícios mais curtos (3 perguntas) e aumente aos poucos.'
      : 'Você está perto — repita só as perguntas que errou antes de um tema novo.',
  ]

  const summary =
    scorePct >= 80
      ? `Bom trabalho em ${exerciseSet.title}! Acertou ${correctCount} de ${total}, mas ainda há pontos a ajustar.`
      : scorePct >= 50
        ? `Resultado mediano em ${exerciseSet.title}: ${correctCount}/${total}. Vale revisar os erros abaixo.`
        : `Em ${exerciseSet.title} você acertou ${correctCount} de ${total}. Não desanime — foque nos padrões que errou.`

  return { summary, weaknesses, improvements }
}
