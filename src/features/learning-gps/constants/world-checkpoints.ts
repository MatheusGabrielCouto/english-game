import { LearningWorldKey, type LearningWorldKeyValue } from '@/types/learning-gps'

type WorldCheckpointCopy = {
  pending: string
  done: string
}

export const WORLD_CHECKPOINT_COPY: Record<LearningWorldKeyValue, WorldCheckpointCopy> = {
  [LearningWorldKey.SURVIVOR]: {
    pending: 'Pratique 2 min de conversação para concluir o Survivor.',
    done: 'Checkpoint concluído — você está pronto para o Explorer!',
  },
  [LearningWorldKey.EXPLORER]: {
    pending: 'Mantenha uma conversa de 5 minutos para concluir o Explorer.',
    done: 'Checkpoint concluído — Professional desbloqueado!',
  },
  [LearningWorldKey.PROFESSIONAL]: {
    pending: 'Participe de uma reunião simulada para concluir o Professional.',
    done: 'Checkpoint concluído — Developer desbloqueado!',
  },
  [LearningWorldKey.DEVELOPER]: {
    pending: 'Simule um dia em equipe global para concluir o Developer.',
    done: 'Checkpoint concluído — Global Engineer desbloqueado!',
  },
  [LearningWorldKey.GLOBAL_ENGINEER]: {
    pending: 'Complete a entrevista internacional para concluir o Global Engineer.',
    done: 'Checkpoint concluído — Legend desbloqueado!',
  },
  [LearningWorldKey.LEGEND]: {
    pending: 'Demonstre domínio C2 em debate e apresentação para concluir o Legend.',
    done: 'Parabéns — você completou toda a trilha até C2!',
  },
}

export const getWorldCheckpointCopy = (worldKey: LearningWorldKeyValue): WorldCheckpointCopy =>
  WORLD_CHECKPOINT_COPY[worldKey]
