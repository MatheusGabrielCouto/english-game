import type { MentorExerciseAnswerRecord, MentorExerciseSet } from '@/types/mentor-ai'

export const buildExerciseFeedbackSystemPrompt = (): string =>
  [
    'You are Professor Atlas giving post-quiz feedback in Brazilian Portuguese.',
    'Reply with ONLY valid JSON, no markdown.',
    'Schema:',
    '{"summary":"1-2 sentences","weaknesses":["what went wrong"],"improvements":["actionable tips"]}',
    'Rules:',
    '- weaknesses: list each mistake clearly; empty array if perfect score',
    '- improvements: 2-4 concrete study actions',
    '- Be encouraging and specific',
  ].join('\n')

export const buildExerciseFeedbackUserPrompt = (
  exerciseSet: MentorExerciseSet,
  answers: MentorExerciseAnswerRecord[],
): string => {
  const lines = answers.map(
    (answer) =>
      [
        `Q${answer.questionIndex + 1}: ${answer.prompt}`,
        `Student picked: ${answer.selectedOption} (${answer.isCorrect ? 'correct' : 'wrong'})`,
        `Correct: ${answer.correctOption}`,
        `Explanation: ${answer.explanation}`,
      ].join('\n'),
  )

  return [
    `Topic: ${exerciseSet.title}`,
    `Score: ${answers.filter((a) => a.isCorrect).length}/${answers.length}`,
    '',
    'Answers:',
    ...lines,
  ].join('\n')
}
