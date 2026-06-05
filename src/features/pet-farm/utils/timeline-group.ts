import { PET_TIMELINE_UI } from '../constants/pet-timeline-ui';

export type TimelineGroupKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'older';

export type TimelineGroupedItem<T extends { unlockedAt: string }> = {
  key: TimelineGroupKey;
  label: string;
  items: T[];
};

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysBetween = (from: Date, to: Date): number => {
  const a = startOfLocalDay(from).getTime();
  const b = startOfLocalDay(to).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
};

export const resolveTimelineGroupKey = (unlockedAt: string, now = new Date()): TimelineGroupKey => {
  const date = new Date(unlockedAt);
  if (Number.isNaN(date.getTime())) return 'older';

  const diff = daysBetween(date, now);
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff <= 7) return 'last7';
  if (diff <= 30) return 'last30';
  return 'older';
};

const GROUP_ORDER: TimelineGroupKey[] = ['today', 'yesterday', 'last7', 'last30', 'older'];

const GROUP_LABEL: Record<TimelineGroupKey, string> = {
  today: PET_TIMELINE_UI.groups.today,
  yesterday: PET_TIMELINE_UI.groups.yesterday,
  last7: PET_TIMELINE_UI.groups.last7,
  last30: PET_TIMELINE_UI.groups.last30,
  older: PET_TIMELINE_UI.groups.older,
};

export const groupTimelineItems = <T extends { unlockedAt: string }>(
  items: T[],
): TimelineGroupedItem<T>[] => {
  const buckets = new Map<TimelineGroupKey, T[]>();
  for (const item of items) {
    const key = resolveTimelineGroupKey(item.unlockedAt);
    const list = buckets.get(key) ?? [];
    list.push(item);
    buckets.set(key, list);
  }

  return GROUP_ORDER.filter((key) => (buckets.get(key)?.length ?? 0) > 0).map((key) => ({
    key,
    label: GROUP_LABEL[key],
    items: (buckets.get(key) ?? []).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt)),
  }));
};
