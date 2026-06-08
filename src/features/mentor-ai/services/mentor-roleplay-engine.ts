import {
    MentorInterviewTrack,
    MentorRoleplayMode,
    MentorRoleplayRole,
    type MentorInterviewTrackValue,
    type MentorRoleplayFeedback,
    type MentorRoleplayModeValue,
    type MentorRoleplayRoleValue,
} from '@/types/mentor-ai'

import { getInterviewTrack, getRoleplayRole } from '../constants/mentor-roleplay-catalog'
import { buildHeuristicRoleplayFeedback } from '../utils/parse-roleplay-feedback'

const OPENINGS: Record<MentorRoleplayRoleValue, string> = {
  [MentorRoleplayRole.INTERVIEWER]:
    '💬 Good morning! Thanks for joining us today. Tell me about yourself and why you want this role.\n💡 Comece com 2–3 frases objetivas sobre experiência e motivação.',
  [MentorRoleplayRole.TOURIST]:
    '💬 Excuse me, I am a bit lost. Could you tell me how to get to the city center from this airport?\n💡 Use frases educadas: *Excuse me*, *Could you tell me…*',
  [MentorRoleplayRole.COWORKER]:
    '💬 Morning! Quick standup — what did you finish yesterday and what is your focus today?\n💡 Estrutura clássica: *Yesterday I… / Today I will… / Blockers…*',
  [MentorRoleplayRole.CLIENT]:
    '💬 Hi! We need a dashboard for our sales team. Can you explain how you would approach this feature?\n💡 Descreva requisitos, usuário e prioridade antes de solução técnica.',
  [MentorRoleplayRole.TEACHER]:
    '💬 Today we will practice Present Perfect. Can you give me one example sentence from your daily life?\n💡 Lembre: *have/has + past participle* para experiências e resultados.',
}

const INTERVIEW_OPENINGS: Record<MentorInterviewTrackValue, string> = {
  [MentorInterviewTrack.FRONTEND]:
    '💬 Hi, I am Alex from the product team. Let us start: how do you decide between client state vs server state in a React app?\n💡 Mencione trade-offs: cache, UX, complexidade.',
  [MentorInterviewTrack.BACKEND]:
    '💬 Welcome! First question: how would you design an idempotent payment API?\n💡 Fale de chaves idempotentes, retries e logs.',
  [MentorInterviewTrack.MOBILE]:
    '💬 Thanks for being here. How do you handle offline-first data in a React Native app?\n💡 Cite fila local, sync e conflitos.',
  [MentorInterviewTrack.DEVOPS]:
    '💬 Let us begin. Walk me through a CI/CD pipeline you trust for production releases.\n💡 Inclua testes, staging, rollback e observabilidade.',
  [MentorInterviewTrack.FULLSTACK]:
    '💬 Great to meet you. Describe a feature you shipped end-to-end and how you measured success.\n💡 Use formato STAR: Situation, Task, Action, Result.',
}

const TURN_REPLIES: string[] = [
  '💬 Interesting — can you elaborate with a concrete example from your experience?\n💡 Use números ou resultados quando possível (*reduced by 30%*).',
  '💬 Good point. What challenge did you face and how did you solve it?\n💡 Conecte problema → ação → resultado.',
  '💬 Could you clarify the trade-offs you considered?\n💡 Compare duas opções e diga por que escolheu uma.',
  '💬 How would you explain this to a non-technical stakeholder?\n💡 Simplifique jargão e foque no valor para o usuário.',
  '💬 What would you do differently if you had more time?\n💡 Mostre reflexão e aprendizado.',
]

const INTERVIEW_FOLLOWUPS: Record<MentorInterviewTrackValue, string[]> = {
  [MentorInterviewTrack.FRONTEND]: [
    '💬 How do you approach accessibility in a design system?\n💡 Mencione ARIA, contraste e testes com leitores de tela.',
    '💬 Tell me about a performance issue you fixed in the browser.\n💡 Fale de profiling, bundle size ou render.',
  ],
  [MentorInterviewTrack.BACKEND]: [
    '💬 How do you prevent N+1 queries in a REST API?\n💡 Cite eager loading, caching ou batching.',
    '💬 Describe how you would roll out a breaking API change.\n💡 Versionamento, deprecation e comunicação.',
  ],
  [MentorInterviewTrack.MOBILE]: [
    '💬 How do you debug a crash that only happens in production?\n💡 Logs, breadcrumbs, Sentry, repro steps.',
    '💬 What is your approach to app store release cadence?\n💡 Feature flags, phased rollout, hotfix.',
  ],
  [MentorInterviewTrack.DEVOPS]: [
    '💬 How do you secure secrets in Kubernetes?\n💡 Secrets manager, RBAC, rotação.',
    '💬 What SLOs would you define for a customer-facing API?\n💡 Latência, erro, disponibilidade.',
  ],
  [MentorInterviewTrack.FULLSTACK]: [
    '💬 How do you split work between frontend and backend in a small team?\n💡 Contratos de API, priorização, ownership.',
    '💬 Tell me about a production incident you helped resolve.\n💡 Detecção, mitigação, postmortem.',
  ],
}

export const MentorRoleplayEngine = {
  buildOpening(
    mode: MentorRoleplayModeValue,
    role: MentorRoleplayRoleValue | null,
    track: MentorInterviewTrackValue | null,
  ): string {
    if (mode === MentorRoleplayMode.INTERVIEW && track) {
      return INTERVIEW_OPENINGS[track]
    }
    if (role) {
      return OPENINGS[role]
    }
    return OPENINGS[MentorRoleplayRole.COWORKER]
  },

  buildTurnReply(
    mode: MentorRoleplayModeValue,
    track: MentorInterviewTrackValue | null,
    turnIndex: number,
    userMessage: string,
  ): string {
    const trimmed = userMessage.trim()
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length

    let tip =
      wordCount < 8
        ? 'Tente responder com pelo menos 2 frases completas.'
        : 'Boa extensão — agora refine conectores (*because, however, for example*).'

    if (mode === MentorRoleplayMode.INTERVIEW && track) {
      const followups = INTERVIEW_FOLLOWUPS[track]
      const line = followups[turnIndex % followups.length] ?? TURN_REPLIES[turnIndex % TURN_REPLIES.length]
      return line.replace('💡', `💡 ${tip} `)
    }

    const line = TURN_REPLIES[turnIndex % TURN_REPLIES.length]
    return `${line.split('\n')[0]}\n💡 ${tip}`
  },

  buildFeedback(userTurns: number, mode: MentorRoleplayModeValue): MentorRoleplayFeedback {
    return buildHeuristicRoleplayFeedback(userTurns, mode === MentorRoleplayMode.INTERVIEW)
  },

  getSessionTitle(
    mode: MentorRoleplayModeValue,
    role: MentorRoleplayRoleValue | null,
    track: MentorInterviewTrackValue | null,
  ): string {
    if (mode === MentorRoleplayMode.INTERVIEW && track) {
      return `Entrevista ${getInterviewTrack(track).label}`
    }
    if (role) {
      return getRoleplayRole(role).scenario
    }
    return 'Roleplay'
  },
}
