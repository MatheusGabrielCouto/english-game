import { PlayerService } from '@/features/player/services/player-service';
import { getTodayKey } from '@/features/quests/utils/date';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { GameEvents } from '@/services/game-events';
import { RoutineRepository } from '@/storage/repositories/routine-repository';
import { CityResourceType } from '@/types/city-resource';
import {
    RoutineCategory,
    type RoutineTodayItem,
    type UserRoutineRecord,
} from '@/types/routine';

import { ROUTINE_TEMPLATE_BY_KEY } from '../catalogs/routine-templates';
import { resolveRoutineRewards } from '../constants/routine-rewards';
import { useRoutinesStore } from '../store/routines-store';
import {
    validateOptionalDuration,
    validateOptionalReward,
    validateRoutineDescription,
    validateRoutineName,
} from '../utils/routine-form-input';
import {
    addDaysUtc,
    computeCompletionRate,
    computeStreakAfterComplete,
    getConsistencyLabel,
    getPeriodKey,
    getPreviousPeriodKey,
    isRoutineDueOnDate,
} from '../utils/routine-schedule';
import { validateReminderTime } from '../utils/routine-time-input';
import { validateRoutineWeekdays } from '../utils/routine-weekdays';

import { CityResourceService } from '@/features/city/services/city-resource-service';

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const normalizeReminderTimeInput = (value?: string | null): string | null => {
  const check = validateReminderTime(value ?? '');
  if (!check.valid) {
    throw new Error(check.error ?? 'Horário de lembrete inválido');
  }
  return check.normalized;
};

const assertRoutineFormInput = (input: CreateRoutineInput): void => {
  const nameCheck = validateRoutineName(input.name);
  if (!nameCheck.valid) throw new Error(nameCheck.error ?? 'Nome inválido');

  const descCheck = validateRoutineDescription(input.description ?? '');
  if (!descCheck.valid) throw new Error(descCheck.error ?? 'Descrição inválida');

  normalizeReminderTimeInput(input.reminderTime);

  const weekdaysCheck = validateRoutineWeekdays(input.frequency, input.weekdays ?? []);
  if (!weekdaysCheck.valid) throw new Error(weekdaysCheck.error ?? 'Dias inválidos');

  const durationCheck = validateOptionalDuration(
    input.expectedDurationMin != null ? String(input.expectedDurationMin) : '',
  );
  if (!durationCheck.valid) throw new Error(durationCheck.error ?? 'Duração inválida');

  const xpCheck = validateOptionalReward(
    input.customXp != null ? String(input.customXp) : '',
    'xp',
  );
  if (!xpCheck.valid) throw new Error(xpCheck.error ?? 'XP inválido');

  const coinsCheck = validateOptionalReward(
    input.customCoins != null ? String(input.customCoins) : '',
    'coins',
  );
  if (!coinsCheck.valid) throw new Error(coinsCheck.error ?? 'Moedas inválidas');
};

export type CreateRoutineInput = {
  name: string;
  description?: string;
  category: UserRoutineRecord['category'];
  frequency: UserRoutineRecord['frequency'];
  reminderTime?: string | null;
  weekdays?: number[];
  expectedDurationMin?: number | null;
  customXp?: number | null;
  customCoins?: number | null;
  templateKey?: string | null;
};

const grantCityResourceForRoutine = async (category: UserRoutineRecord['category']): Promise<void> => {
  switch (category) {
    case RoutineCategory.ENGLISH_COURSE:
    case RoutineCategory.VOCABULARY:
    case RoutineCategory.READING:
    case RoutineCategory.GRAMMAR:
      await CityResourceService.grant(CityResourceType.LEXICON_BRICK, 1, 'routine');
      break;
    case RoutineCategory.SPEAKING:
    case RoutineCategory.CAREER:
    case RoutineCategory.PROGRAMMING_ENGLISH:
      await CityResourceService.grant(CityResourceType.FLUENCY_CEMENT, 1, 'routine');
      break;
    default:
      await CityResourceService.grant(CityResourceType.CONSISTENCY_WOOD, 1, 'routine');
      break;
  }
};

const buildTodayItem = async (
  routine: UserRoutineRecord,
  dateKey: string,
): Promise<RoutineTodayItem> => {
  const stats = (await RoutineRepository.getStats(routine.id)) ?? {
    routineId: routine.id,
    totalCompleted: 0,
    totalMissed: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedPeriod: null,
    updatedAt: new Date().toISOString(),
  };

  const periodKey = getPeriodKey(routine.frequency, dateKey);
  const completion = await RoutineRepository.getCompletion(routine.id, periodKey);
  const rate = computeCompletionRate(stats.totalCompleted, stats.totalMissed);

  return {
    routine,
    stats,
    periodKey,
    completed: Boolean(completion),
    completion,
    isDueToday: isRoutineDueOnDate(routine, dateKey),
    completionRate: rate,
    consistencyLabel: getConsistencyLabel(rate),
  };
};

const refreshStore = async (): Promise<void> => {
  const dateKey = getTodayKey();
  const routines = await RoutineRepository.listActive();
  const items = await Promise.all(routines.map((r) => buildTodayItem(r, dateKey)));

  const dueToday = items.filter((item) => item.isDueToday);
  const completedToday = dueToday.filter((item) => item.completed);
  const pendingToday = dueToday.filter((item) => !item.completed);

  useRoutinesStore.setState({
    todayItems: items,
    dueToday,
    completedToday,
    pendingToday,
    allRoutines: routines,
    isLoading: false,
  });
};

export const RoutineService = {
  async initialize(): Promise<void> {
    await RoutineService.reconcileMissedPeriods();
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },

  /** Marca o período anterior como perdido se estava devido e não foi concluído. */
  async reconcileMissedPeriods(): Promise<void> {
    const today = getTodayKey();
    const routines = await RoutineRepository.listActive();

    for (const routine of routines) {
      const stats = await RoutineRepository.ensureStats(routine.id);
      const currentPeriod = getPeriodKey(routine.frequency, today);
      const previousPeriod = getPreviousPeriodKey(routine.frequency, currentPeriod);
      if (!previousPeriod) continue;

      const wasDue =
        routine.frequency === 'daily' || routine.frequency === 'custom'
          ? isRoutineDueOnDate(routine, addDaysUtc(today, -1))
          : true;

      if (!wasDue) continue;

      const existing = await RoutineRepository.getCompletion(routine.id, previousPeriod);
      if (existing) continue;

      const { LearningAppStateRepository } = await import(
        '@/storage/repositories/learning-app-state-repository'
      );
      const flagKey = `routine_missed_${routine.id}_${previousPeriod}`;
      if ((await LearningAppStateRepository.get(flagKey)) === '1') continue;

      await LearningAppStateRepository.set(flagKey, '1');

      await RoutineRepository.saveStats({
        ...stats,
        totalMissed: stats.totalMissed + 1,
        currentStreak: 0,
        updatedAt: new Date().toISOString(),
      });

      GameEvents.emit({
        type: 'ROUTINE_MISSED',
        routineId: routine.id,
        routineName: routine.name,
        periodKey: previousPeriod,
      });
    }
  },

  async createFromTemplate(templateKey: string): Promise<UserRoutineRecord> {
    const template = ROUTINE_TEMPLATE_BY_KEY[templateKey];
    if (!template) throw new Error('Modelo não encontrado');

    return RoutineService.create({
      name: template.name,
      description: template.description,
      category: template.category,
      frequency: template.frequency,
      weekdays: template.weekdays,
      expectedDurationMin: template.expectedDurationMin,
      customXp: template.defaultXp,
      customCoins: template.defaultCoins,
      templateKey: template.key,
    });
  },

  async create(input: CreateRoutineInput): Promise<UserRoutineRecord> {
    const now = new Date().toISOString();
    const routine: UserRoutineRecord = {
      id: createId('routine'),
      name: validateRoutineName(input.name).normalized ?? input.name.trim(),
      description: validateRoutineDescription(input.description ?? '').normalized,
      category: input.category,
      frequency: input.frequency,
      reminderTime: normalizeReminderTimeInput(input.reminderTime),
      weekdays: input.weekdays ?? [],
      expectedDurationMin: validateOptionalDuration(
        input.expectedDurationMin != null ? String(input.expectedDurationMin) : '',
      ).normalizedNumber,
      customXp: validateOptionalReward(
        input.customXp != null ? String(input.customXp) : '',
        'xp',
      ).normalizedNumber,
      customCoins: validateOptionalReward(
        input.customCoins != null ? String(input.customCoins) : '',
        'coins',
      ).normalizedNumber,
      templateKey: input.templateKey ?? null,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    assertRoutineFormInput(input);

    await RoutineRepository.insert(routine);
    GameEvents.emit({ type: 'ROUTINE_CREATED', routineId: routine.id, templateKey: routine.templateKey });
    await refreshStore();
    return routine;
  },

  async update(routineId: string, input: CreateRoutineInput): Promise<UserRoutineRecord> {
    const existing = await RoutineRepository.getById(routineId);
    if (!existing) throw new Error('Rotina não encontrada');

    const updated: UserRoutineRecord = {
      ...existing,
      name: validateRoutineName(input.name).normalized ?? input.name.trim(),
      description: validateRoutineDescription(input.description ?? '').normalized,
      category: input.category,
      frequency: input.frequency,
      reminderTime: normalizeReminderTimeInput(input.reminderTime),
      weekdays: input.weekdays ?? [],
      expectedDurationMin: validateOptionalDuration(
        input.expectedDurationMin != null ? String(input.expectedDurationMin) : '',
      ).normalizedNumber,
      customXp: validateOptionalReward(
        input.customXp != null ? String(input.customXp) : '',
        'xp',
      ).normalizedNumber,
      customCoins: validateOptionalReward(
        input.customCoins != null ? String(input.customCoins) : '',
        'coins',
      ).normalizedNumber,
      updatedAt: new Date().toISOString(),
    };

    assertRoutineFormInput(input);

    await RoutineRepository.update(updated);
    await refreshStore();
    const { FeatureNotificationSyncService } = await import(
      '@/features/notifications/services/feature-notification-sync-service'
    );
    void FeatureNotificationSyncService.rescheduleAll();
    return updated;
  },

  async archive(routineId: string): Promise<void> {
    const existing = await RoutineRepository.getById(routineId);
    if (!existing) return;

    await RoutineRepository.update({
      ...existing,
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
    await refreshStore();
  },

  async complete(routineId: string): Promise<void> {
    const routine = await RoutineRepository.getById(routineId);
    if (!routine || routine.isArchived) return;

    const dateKey = getTodayKey();
    const periodKey = getPeriodKey(routine.frequency, dateKey);
    const existing = await RoutineRepository.getCompletion(routineId, periodKey);
    if (existing) return;

    const template = routine.templateKey
      ? ROUTINE_TEMPLATE_BY_KEY[routine.templateKey]
      : null;
    const rewards = resolveRoutineRewards(routine, template);
    const now = new Date().toISOString();

    await RoutineRepository.insertCompletion({
      id: createId('routine_done'),
      routineId,
      periodKey,
      completedAt: now,
      xpAwarded: rewards.xp,
      coinsAwarded: rewards.coins,
      studyPointsAwarded: rewards.studyPoints,
    });

    const stats = await RoutineRepository.ensureStats(routineId);
    const newStreak = computeStreakAfterComplete(
      routine.frequency,
      stats.lastCompletedPeriod,
      periodKey,
      stats.currentStreak,
    );

    await RoutineRepository.saveStats({
      ...stats,
      totalCompleted: stats.totalCompleted + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      lastCompletedPeriod: periodKey,
      updatedAt: now,
    });

    PlayerService.addXP(rewards.xp);
    PlayerService.addCoins(rewards.coins);
    if (rewards.studyPoints > 0) {
      await StudyPointsService.earn(rewards.studyPoints, routine.name, 'routine');
    }

    await grantCityResourceForRoutine(routine.category);

    GameEvents.emit({
      type: 'ROUTINE_COMPLETED',
      routineId: routine.id,
      routineName: routine.name,
      category: routine.category,
      frequency: routine.frequency,
      periodKey,
      xp: rewards.xp,
      coins: rewards.coins,
      studyPoints: rewards.studyPoints,
      currentStreak: newStreak,
    });

    await refreshStore();
  },

  async uncomplete(routineId: string): Promise<void> {
    const routine = await RoutineRepository.getById(routineId);
    if (!routine) return;

    const periodKey = getPeriodKey(routine.frequency);
    const completion = await RoutineRepository.getCompletion(routineId, periodKey);
    if (!completion) return;

    await RoutineRepository.deleteCompletion(routineId, periodKey);

    const stats = await RoutineRepository.ensureStats(routineId);
    await RoutineRepository.saveStats({
      ...stats,
      totalCompleted: Math.max(0, stats.totalCompleted - 1),
      currentStreak: Math.max(0, stats.currentStreak - 1),
      lastCompletedPeriod:
        stats.lastCompletedPeriod === periodKey ? null : stats.lastCompletedPeriod,
      updatedAt: new Date().toISOString(),
    });

    await refreshStore();
  },
};
