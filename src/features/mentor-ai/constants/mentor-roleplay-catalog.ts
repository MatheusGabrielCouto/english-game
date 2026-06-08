import {
    MentorInterviewTrack,
    MentorRoleplayRole,
    type MentorInterviewTrackValue,
    type MentorRoleplayRoleValue,
} from '@/types/mentor-ai'

export type MentorRoleplayRoleOption = {
  id: MentorRoleplayRoleValue
  label: string
  emoji: string
  scenario: string
  description: string
}

export type MentorInterviewTrackOption = {
  id: MentorInterviewTrackValue
  label: string
  emoji: string
  description: string
}

export const MENTOR_ROLEPLAY_MIN_TURNS = 6

export const MENTOR_ROLEPLAY_ROLES: MentorRoleplayRoleOption[] = [
  {
    id: MentorRoleplayRole.INTERVIEWER,
    label: 'Entrevistador',
    emoji: '💼',
    scenario: 'Entrevista de emprego',
    description: 'Responda como em uma job interview em inglês.',
  },
  {
    id: MentorRoleplayRole.TOURIST,
    label: 'Turista',
    emoji: '🗺️',
    scenario: 'Pedir informações',
    description: 'Peça direções, horários e ajuda em um aeroporto.',
  },
  {
    id: MentorRoleplayRole.COWORKER,
    label: 'Colega de time',
    emoji: '👥',
    scenario: 'Daily standup',
    description: 'Conte o que fez ontem e o que vai fazer hoje.',
  },
  {
    id: MentorRoleplayRole.CLIENT,
    label: 'Cliente',
    emoji: '📋',
    scenario: 'Requisito de produto',
    description: 'Explique uma feature e negocie prioridades.',
  },
  {
    id: MentorRoleplayRole.TEACHER,
    label: 'Professor',
    emoji: '📚',
    scenario: 'Aula de gramática',
    description: 'Pratique explicando regras e respondendo exercícios.',
  },
]

export const MENTOR_INTERVIEW_TRACKS: MentorInterviewTrackOption[] = [
  {
    id: MentorInterviewTrack.FRONTEND,
    label: 'Frontend',
    emoji: '⚛️',
    description: 'React, UI, acessibilidade e performance web.',
  },
  {
    id: MentorInterviewTrack.BACKEND,
    label: 'Backend',
    emoji: '🛠️',
    description: 'APIs, bancos de dados, escalabilidade e segurança.',
  },
  {
    id: MentorInterviewTrack.MOBILE,
    label: 'Mobile',
    emoji: '📱',
    description: 'React Native, ciclo de vida e publicação em lojas.',
  },
  {
    id: MentorInterviewTrack.DEVOPS,
    label: 'DevOps',
    emoji: '☁️',
    description: 'CI/CD, containers, observabilidade e infraestrutura.',
  },
  {
    id: MentorInterviewTrack.FULLSTACK,
    label: 'Fullstack',
    emoji: '🧩',
    description: 'Visão ponta a ponta: front, back e entrega de produto.',
  },
]

export const getRoleplayRole = (id: MentorRoleplayRoleValue): MentorRoleplayRoleOption =>
  MENTOR_ROLEPLAY_ROLES.find((role) => role.id === id) ?? MENTOR_ROLEPLAY_ROLES[0]

export const getInterviewTrack = (id: MentorInterviewTrackValue): MentorInterviewTrackOption =>
  MENTOR_INTERVIEW_TRACKS.find((track) => track.id === id) ?? MENTOR_INTERVIEW_TRACKS[0]
