import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
    addDaysToDateKey,
    getCalendarGridDays,
    getMonthBounds,
    getYesterdayKey,
    isToday,
    isYesterday,
    parseDateKey,
    toDateKey,
} from '../date';

describe('toDateKey / parseDateKey', () => {
  it('round-trips a local date', () => {
    const date = new Date(2026, 4, 31);
    const key = toDateKey(date);
    assert.equal(key, '2026-05-31');
    assert.equal(toDateKey(parseDateKey(key)), key);
  });
});

describe('addDaysToDateKey', () => {
  it('adds days across month boundaries', () => {
    assert.equal(addDaysToDateKey('2026-05-31', 1), '2026-06-01');
    assert.equal(addDaysToDateKey('2026-06-01', -1), '2026-05-31');
  });
});

describe('getYesterdayKey', () => {
  it('returns the previous day relative to today', () => {
    assert.equal(getYesterdayKey('2026-05-31'), '2026-05-30');
  });
});

describe('isToday / isYesterday', () => {
  it('detects today and yesterday relative to a reference day', () => {
    const today = '2026-05-31';
    assert.equal(isToday('2026-05-31', today), true);
    assert.equal(isYesterday('2026-05-30', today), true);
    assert.equal(isToday('2026-05-30', today), false);
  });
});

describe('getMonthBounds', () => {
  it('returns the first and last day of the month', () => {
    const bounds = getMonthBounds(2026, 5);
    assert.equal(bounds.startDate, '2026-05-01');
    assert.equal(bounds.endDate, '2026-05-31');
  });
});

describe('getCalendarGridDays', () => {
  it('pads May 2026 starting on Friday', () => {
    const grid = getCalendarGridDays(2026, 5);
    assert.equal(grid.filter((day) => day === null).length, 4);
    assert.equal(grid.filter(Boolean).length, 31);
    assert.equal(grid.at(-1), '2026-05-31');
  });
});
