import type { MentorAIContext, MentorErrorLogRecord, MentorExerciseSet } from '@/types/mentor-ai'

import {
  buildExerciseSetFromErrors,
  resolveSupplementTopic,
} from '../utils/build-questions-from-errors'

const toTopicKey = (topic: string): string =>
  topic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

const PAST_SIMPLE: MentorExerciseSet = {
  topic: 'past_simple',
  title: 'Past Simple',
  questions: [
    {
      prompt: 'She ___ (go) to the store yesterday.',
      options: ['go', 'went', 'gone', 'going'],
      correctIndex: 1,
      explanation: 'Past Simple de "go" é irregular: went.',
    },
    {
      prompt: 'They ___ (not / see) the movie last week.',
      options: ["didn't see", "don't see", "haven't seen", "not saw"],
      correctIndex: 0,
      explanation: 'Negativa no Past Simple: did not + verbo no infinitivo.',
    },
    {
      prompt: '___ you ___ (finish) your homework?',
      options: ['Did / finish', 'Do / finish', 'Have / finished', 'Are / finishing'],
      correctIndex: 0,
      explanation: 'Perguntas no Past Simple usam Did + sujeito + verbo base.',
    },
    {
      prompt: 'He ___ (buy) a new laptop two days ago.',
      options: ['buyed', 'bought', 'buys', 'buying'],
      correctIndex: 1,
      explanation: 'Past Simple de "buy" é irregular: bought.',
    },
    {
      prompt: 'We ___ (be) at home all morning.',
      options: ['was', 'were', 'are', 'been'],
      correctIndex: 1,
      explanation: 'Com "we" no passado usamos were.',
    },
  ],
}

const PRESENT_PERFECT: MentorExerciseSet = {
  topic: 'present_perfect',
  title: 'Present Perfect',
  questions: [
    {
      prompt: 'I ___ (never / visit) Japan.',
      options: ['never visited', 'have never visited', 'never visit', 'am never visiting'],
      correctIndex: 1,
      explanation: 'Experiências de vida usam have/has + past participle.',
    },
    {
      prompt: 'She ___ (just / finish) her presentation.',
      options: ['just finished', 'has just finished', 'just finishes', 'is just finishing'],
      correctIndex: 1,
      explanation: '"Just" com Present Perfect: has/have + just + particípio.',
    },
    {
      prompt: 'How long ___ you ___ (live) here?',
      options: ['do / live', 'did / live', 'have / lived', 'are / living'],
      correctIndex: 2,
      explanation: 'Duração até agora: How long + have/has + past participle.',
    },
    {
      prompt: 'They ___ (not / arrive) yet.',
      options: ["didn't arrive", "haven't arrived", "don't arrive", "aren't arriving"],
      correctIndex: 1,
      explanation: '"Yet" combina com Present Perfect na negativa.',
    },
    {
      prompt: '___ he ever ___ (try) sushi?',
      options: ['Did / try', 'Has / tried', 'Does / try', 'Is / trying'],
      correctIndex: 1,
      explanation: 'Perguntas com "ever" usam Present Perfect.',
    },
  ],
}

const TRAVEL: MentorExerciseSet = {
  topic: 'travel',
  title: 'Travel vocabulary',
  questions: [
    {
      prompt: 'Where do you show your ___ at the airport gate?',
      options: ['boarding pass', 'luggage tag', 'passport photo', 'seat belt'],
      correctIndex: 0,
      explanation: 'Boarding pass é o cartão de embarque.',
    },
    {
      prompt: 'Your ___ cannot exceed 23 kg on most airlines.',
      options: ['carry-on', 'checked baggage', 'boarding pass', 'departure lounge'],
      correctIndex: 1,
      explanation: 'Checked baggage = bagagem despachada.',
    },
    {
      prompt: 'We had a long ___ because of bad weather.',
      options: ['layover', 'delay', 'connection', 'itinerary'],
      correctIndex: 1,
      explanation: 'Delay = atraso no voo.',
    },
    {
      prompt: 'Please fasten your ___ before takeoff.',
      options: ['seat belt', 'seat map', 'gate number', 'customs form'],
      correctIndex: 0,
      explanation: 'Seat belt = cinto de segurança.',
    },
    {
      prompt: 'I need to fill out a ___ at immigration.',
      options: ['boarding pass', 'customs declaration', 'flight attendant', 'baggage claim'],
      correctIndex: 1,
      explanation: 'Customs declaration = declaração alfandegária.',
    },
  ],
}

const OFFLINE_SETS: Record<string, MentorExerciseSet> = {
  past_simple: PAST_SIMPLE,
  past: PAST_SIMPLE,
  present_perfect: PRESENT_PERFECT,
  perfect: PRESENT_PERFECT,
  travel: TRAVEL,
  viagem: TRAVEL,
}

const matchesTopic = (topic: string, keys: string[]): boolean => {
  const normalized = topic.toLowerCase()
  return keys.some((key) => normalized.includes(key.replace(/_/g, ' ')) || normalized.includes(key))
}

export const MentorExerciseEngine = {
  tryGenerateFromErrors(
    errors: MentorErrorLogRecord[],
    context: MentorAIContext,
  ): MentorExerciseSet | null {
    const supplementTopic = resolveSupplementTopic(errors)
    const supplementSet = MentorExerciseEngine.tryGenerate(supplementTopic, context)
    const supplementQuestions = supplementSet?.questions ?? []

    return buildExerciseSetFromErrors(errors, supplementQuestions)
  },

  tryGenerate(topic: string, _context: MentorAIContext): MentorExerciseSet | null {
    const key = toTopicKey(topic)
    if (OFFLINE_SETS[key]) return OFFLINE_SETS[key]

    if (matchesTopic(topic, ['past simple', 'past_simple', 'passado simples'])) {
      return PAST_SIMPLE
    }
    if (matchesTopic(topic, ['present perfect', 'present_perfect', 'presente perfeito'])) {
      return PRESENT_PERFECT
    }
    if (matchesTopic(topic, ['travel', 'viagem', 'airport', 'aeroporto'])) {
      return TRAVEL
    }

    return null
  },
}
