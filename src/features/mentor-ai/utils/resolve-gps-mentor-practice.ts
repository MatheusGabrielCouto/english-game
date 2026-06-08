import type { Href } from 'expo-router'

import { routes } from '@/constants/routes'
import {
    LearningSkillKey,
    LearningUnitKind,
    type LearningSkillKeyValue,
    type LearningUnitKindValue,
} from '@/types/learning-gps'

export type GpsMentorPracticeInput = {
  skillKey: LearningSkillKeyValue
  title: string
  description?: string
  unitKey?: string
  blockId?: string
  unitKind?: LearningUnitKindValue
}

type GpsMentorPracticeTarget = {
  route: string
  label: string
  tab?: 'exercise' | 'flashcards'
}

export const mapUnitKindToSkill = (kind: LearningUnitKindValue): LearningSkillKeyValue => {
  switch (kind) {
    case LearningUnitKind.GRAMMAR:
      return LearningSkillKey.GRAMMAR
    case LearningUnitKind.SPEAKING:
    case LearningUnitKind.CHECKPOINT:
      return LearningSkillKey.SPEAKING
    default:
      return LearningSkillKey.VOCABULARY
  }
}

const resolveTarget = (input: GpsMentorPracticeInput): GpsMentorPracticeTarget => {
  const skillKey = input.skillKey

  if (skillKey === LearningSkillKey.SPEAKING || input.unitKind === LearningUnitKind.SPEAKING) {
    return { route: routes.mentor.roleplay, label: 'Conversar com o Atlas' }
  }

  if (skillKey === LearningSkillKey.GRAMMAR || input.unitKind === LearningUnitKind.GRAMMAR) {
    return { route: routes.mentor.exercise, label: 'Exercícios com o Atlas' }
  }

  if (skillKey === LearningSkillKey.WRITING) {
    return { route: routes.mentor.correct, label: 'Escrever com o Atlas' }
  }

  if (skillKey === LearningSkillKey.VOCABULARY || input.unitKind === LearningUnitKind.VOCABULARY) {
    return {
      route: routes.mentor.exercise,
      label: 'Vocabulário com o Atlas',
      tab: 'flashcards',
    }
  }

  return { route: routes.mentor.chat, label: 'Estudar com o Atlas' }
}

export const buildGpsMentorTopic = (input: Pick<GpsMentorPracticeInput, 'title' | 'description'>): string => {
  const base = input.description?.trim()
    ? `${input.title}: ${input.description.trim()}`
    : input.title.trim()
  return base.slice(0, 160)
}

export const buildGpsMentorPracticeHref = (input: GpsMentorPracticeInput): Href => {
  const target = resolveTarget(input)
  const params = new URLSearchParams({
    gps: '1',
    skill: input.skillKey,
    title: input.title,
    topic: buildGpsMentorTopic(input),
  })

  if (input.unitKey) params.set('unitKey', input.unitKey)
  if (input.blockId) params.set('blockId', input.blockId)
  if (input.description) params.set('description', input.description.slice(0, 200))
  if (target.tab) params.set('tab', target.tab)

  return `${target.route}?${params.toString()}` as Href
}

export const resolveGpsMentorPracticeLabel = (input: GpsMentorPracticeInput): string =>
  resolveTarget(input).label
