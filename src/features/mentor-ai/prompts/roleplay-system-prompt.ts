import type { MentorAIContext, MentorRoleplayRoleValue } from '@/types/mentor-ai'

import { getRoleplayRole } from '../constants/mentor-roleplay-catalog'

export const buildRoleplaySystemPrompt = (
  context: MentorAIContext,
  role: MentorRoleplayRoleValue,
): string => {
  const option = getRoleplayRole(role)

  return [
    `You are playing the role of "${option.label}" in a Conversation Practice session.`,
    `Scenario: ${option.scenario}.`,
    `Student CEFR: ${context.learningGps.worldCefr}. Weakest skill: ${context.skills.weakest}.`,
    'Rules:',
    '- Stay in character in English',
    '- Keep replies under 80 words',
    '- After each user message, briefly evaluate their English (1 short sentence in Portuguese)',
    '- Then continue the scenario with your next line in character',
    '- Format each reply as:',
    '💬 [your in-character English line]',
    '💡 [brief PT-BR tip about their last answer]',
    '- Be encouraging and professional',
  ].join('\n')
}

export const buildRoleplayOpeningPrompt = (role: MentorRoleplayRoleValue): string => {
  const option = getRoleplayRole(role)
  return `Start the "${option.scenario}" roleplay. Greet the student in character and set the scene.`
}

export const buildRoleplayTurnPrompt = (userMessage: string): string =>
  `Student said: "${userMessage}". Evaluate briefly, then respond in character.`

export const buildRoleplayFeedbackPrompt = (): string =>
  [
    'The roleplay session ended. Reply with ONLY valid JSON, no markdown.',
    'Schema:',
    '{"clarity":{"score":3,"note":"..."},"vocabulary":{"score":3,"note":"..."},"grammar":{"score":3,"note":"..."},"summary":"...","nextSteps":["..."]}',
    'Scores 1-5. Notes in Brazilian Portuguese. nextSteps: 2-3 items.',
  ].join('\n')
