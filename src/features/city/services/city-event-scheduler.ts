import type { CityEventDefinition, CityEventScheduleRule } from '@/types/city-event';
import { CITY_EVENTS_CATALOG } from '../catalogs/city-events-catalog';
import { DEV_FORCE_CITY_EVENT_KEY } from '../constants/city-event-config';

const pad = (n: number): string => String(n).padStart(2, '0');

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const annualWindowContains = (rule: CityEventScheduleRule, date: Date): boolean => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const startKey = rule.startMonth * 100 + rule.startDay;
  const endKey = rule.endMonth * 100 + rule.endDay;
  const currentKey = month * 100 + day;

  if (startKey <= endKey) {
    return currentKey >= startKey && currentKey <= endKey;
  }

  return currentKey >= startKey || currentKey <= endKey;
};

const eventEndDate = (rule: CityEventScheduleRule, now: Date): Date => {
  const year = now.getFullYear();
  const end = new Date(year, rule.endMonth - 1, rule.endDay, 23, 59, 59, 999);
  if (toDateKey(now) > toDateKey(end) && rule.startMonth > rule.endMonth) {
    return new Date(year + 1, rule.endMonth - 1, rule.endDay, 23, 59, 59, 999);
  }
  return end;
};

export const CityEventScheduler = {
  isEventInWindow(event: CityEventDefinition, now: Date = new Date()): boolean {
    if (DEV_FORCE_CITY_EVENT_KEY === event.eventKey) return true;
    return annualWindowContains(event.schedule, now);
  },

  getActiveEvents(now: Date = new Date()): CityEventDefinition[] {
    const active = CITY_EVENTS_CATALOG.filter((event) =>
      CityEventScheduler.isEventInWindow(event, now),
    );

    if (DEV_FORCE_CITY_EVENT_KEY) {
      const forced = CITY_EVENTS_CATALOG.find((e) => e.eventKey === DEV_FORCE_CITY_EVENT_KEY);
      if (forced && !active.some((e) => e.eventKey === forced.eventKey)) {
        return [forced, ...active].sort((a, b) => b.priority - a.priority);
      }
    }

    return active.sort((a, b) => b.priority - a.priority);
  },

  getActiveMajorEvent(now: Date = new Date()): CityEventDefinition | null {
    if (DEV_FORCE_CITY_EVENT_KEY) {
      const forced = CITY_EVENTS_CATALOG.find((e) => e.eventKey === DEV_FORCE_CITY_EVENT_KEY);
      if (forced) return forced;
    }

    const events = CityEventScheduler.getActiveEvents(now);
    return events.find((e) => e.major) ?? events[0] ?? null;
  },

  getDaysRemaining(event: CityEventDefinition, now: Date = new Date()): number {
    const end = eventEndDate(event.schedule, now);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  },
};
