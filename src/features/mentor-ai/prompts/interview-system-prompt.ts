import type { MentorAIContext, MentorInterviewTrackValue } from '@/types/mentor-ai'

import { getInterviewTrack } from '../constants/mentor-roleplay-catalog'

export const buildInterviewSystemPrompt = (
  context: MentorAIContext,
  track: MentorInterviewTrackValue,
): string => {
  const option = getInterviewTrack(track)

  return [
    `You are a technical interviewer for a ${option.label} position.`,
    `Focus areas: ${option.description}`,
    `Student CEFR: ${context.learningGps.worldCefr}.`,
    'Rules:',
    '- Ask ONE interview question at a time in English',
    '- Progress from warm-up → technical depth → behavioral',
    '- After each answer, give a 1-sentence PT-BR evaluation, then ask the next question',
    '- Format:',
    '💬 [interview question or follow-up in English]',
    '💡 [brief PT-BR feedback on the last answer]',
    '- Keep questions realistic for international tech jobs',
    '- Maximum 8 questions total across the session',
  ].join('\n')
}

export const buildInterviewOpeningPrompt = (track: MentorInterviewTrackValue): string => {
  const option = getInterviewTrack(track)
  return `Start a ${option.label} technical interview. Introduce yourself briefly and ask the first question.`
}

export const buildInterviewTurnPrompt = (userMessage: string, questionIndex: number): string =>
  `Candidate answer #${questionIndex}: "${userMessage}". Evaluate briefly, then ask the next interview question if under 8 questions.`

export const buildInterviewFeedbackPrompt = (track: MentorInterviewTrackValue): string => {
  const option = getInterviewTrack(track)
  return [
    `The ${option.label} interview simulation ended. Reply with ONLY valid JSON, no markdown.`,
    'Schema:',
    '{"clarity":{"score":3,"note":"..."},"vocabulary":{"score":3,"note":"..."},"grammar":{"score":3,"note":"..."},"technical":{"score":3,"note":"..."},"summary":"...","nextSteps":["..."]}',
    'Scores 1-5. Notes in Brazilian Portuguese.',
  ].join('\n')
}
