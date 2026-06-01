import { WeeklyMissionType } from '@/types/weekly-mission-type';
import type { WeekBounds } from '../utils/week';

export type WeeklyMissionTemplate = {
  id: string;
  title: string;
  description: string;
  missionType: (typeof WeeklyMissionType)[keyof typeof WeeklyMissionType];
  targetValue: number;
  xpReward: number;
  coinReward: number;
};

export const DEFAULT_WEEKLY_MISSION_TEMPLATES: WeeklyMissionTemplate[] = [
  {
    id: 'weekly-study-days',
    title: 'Estudar 5 dias',
    description: 'Estude em 5 dias diferentes nesta semana.',
    missionType: WeeklyMissionType.STUDY_DAYS,
    targetValue: 5,
    xpReward: 150,
    coinReward: 75,
  },
  {
    id: 'weekly-daily-missions',
    title: 'Completar 20 missões diárias',
    description: 'Conclua 20 missões diárias durante a semana.',
    missionType: WeeklyMissionType.DAILY_MISSIONS_COMPLETED,
    targetValue: 20,
    xpReward: 200,
    coinReward: 100,
  },
  {
    id: 'weekly-xp',
    title: 'Ganhar 1000 XP',
    description: 'Acumule 1000 pontos de experiência nesta semana.',
    missionType: WeeklyMissionType.XP_GAINED,
    targetValue: 1000,
    xpReward: 250,
    coinReward: 125,
  },
  {
    id: 'weekly-words',
    title: 'Aprender 50 palavras',
    description: 'Aprenda 50 palavras novas (atualizado automaticamente).',
    missionType: WeeklyMissionType.WORDS_LEARNED,
    targetValue: 50,
    xpReward: 180,
    coinReward: 90,
  },
  {
    id: 'weekly-speaking',
    title: '10 sessões de speaking',
    description: 'Complete 10 sessões de speaking (atualizado automaticamente).',
    missionType: WeeklyMissionType.SPEAKING_SESSIONS,
    targetValue: 10,
    xpReward: 220,
    coinReward: 110,
  },
];

export const buildWeeklyMissionFromTemplate = (
  template: WeeklyMissionTemplate,
  bounds: WeekBounds,
): {
  id: string;
  title: string;
  description: string;
  missionType: WeeklyMissionTemplate['missionType'];
  targetValue: number;
  currentValue: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
  weekStartDate: string;
  weekEndDate: string;
  createdAt: string;
} => ({
  id: template.id,
  title: template.title,
  description: template.description,
  missionType: template.missionType,
  targetValue: template.targetValue,
  currentValue: 0,
  xpReward: template.xpReward,
  coinReward: template.coinReward,
  completed: false,
  claimed: false,
  weekStartDate: bounds.weekStartDate,
  weekEndDate: bounds.weekEndDate,
  createdAt: new Date().toISOString(),
});
