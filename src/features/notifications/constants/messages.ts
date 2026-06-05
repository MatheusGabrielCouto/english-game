import { NotificationCategory } from '@/types/notification';

export const NOTIFICATION_MESSAGES: Record<string, string[]> = {
  [NotificationCategory.DAILY_REMINDER]: [
    'Hora de continuar sua jornada de inglês.',
    'Sua carreira internacional começa hoje.',
    'Vamos completar as missões de hoje.',
    'Mais um dia para evoluir.',
  ],
  [NotificationCategory.STREAK_RISK]: [
    'Sua sequência pode zerar hoje — uma missão rápida salva o dia.',
    'Já faz horas desde o último estudo. Não deixe a chama apagar.',
    'Última chance de manter sua sequência hoje.',
  ],
  [NotificationCategory.STREAK_REMINDER]: [
    'Sua sequência está esperando por você.',
    'Não perca seu progresso hoje.',
    'Mantenha a sequência viva.',
    'Vamos continuar de onde parou.',
  ],
  [NotificationCategory.SHIELD_WARNING]: [
    'Você não tem escudos restantes.',
    'Sua sequência está desprotegida.',
    'Estude hoje para proteger seu progresso.',
  ],
  [NotificationCategory.PET_REMINDER]: [
    'Seu pet sente sua falta.',
    'Seu pet está esperando a lição de hoje.',
    'Seu pet quer evoluir.',
    'Seu companheiro está pronto para estudar com você.',
  ],
  [NotificationCategory.CONTRACT_REMINDER]: [
    'Seu contrato ainda está ativo.',
    'Continue — você está progredindo.',
    'Não falhe seu contrato.',
    'Seu contrato precisa de você hoje.',
  ],
  [NotificationCategory.ACHIEVEMENT_PROGRESS]: [
    'Você está perto de desbloquear uma conquista.',
    'Falta só um passo para a recompensa.',
    'Uma nova conquista está ao alcance.',
  ],
  [NotificationCategory.CITY_PROGRESS]: [
    'Sua cidade pode crescer hoje.',
    'Estude para desbloquear o próximo prédio.',
    'Sua cidade internacional está esperando.',
  ],
};

export const buildStreakRiskBody = (currentStreak: number, seed: number): string => {
  const templates = NOTIFICATION_MESSAGES[NotificationCategory.STREAK_RISK] ?? []
  const base = templates[seed % templates.length] ?? templates[0] ?? 'Estude hoje para manter sua sequência.'

  if (currentStreak <= 0) return base

  return `🔥 ${currentStreak} dias em risco — ${base}`
}

export const pickNotificationMessage = (category: string, seed: number): string => {
  const messages = NOTIFICATION_MESSAGES[category] ?? NOTIFICATION_MESSAGES[NotificationCategory.DAILY_REMINDER];
  return messages[seed % messages.length];
};
