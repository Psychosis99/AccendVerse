import { describe, expect, test } from '@jest/globals';
import { computeStreaks, fromKey, heatLevel, heatmapWeeks, toKey, trainingDaysBetween, weekStart } from '../src/lib/calendar';
import { setsByDate, weeklySeries } from '../src/lib/stats';
import type { DayLog } from '../src/data/types';

// 2026-10-25 is a Sunday; 2026-10-24 is a Saturday; 2026-10-19 is a Monday.
const SUNDAY = fromKey('2026-10-25');
const SATURDAY = fromKey('2026-10-24');
const MONDAY = fromKey('2026-10-26');

describe('calendar', () => {
  test('weeks start on Monday', () => {
    expect(toKey(weekStart(SUNDAY))).toBe('2026-10-19');
    expect(toKey(weekStart(MONDAY))).toBe('2026-10-26');
  });

  test('heatmap weeks have Mon–Sat only and end with the current week', () => {
    const weeks = heatmapWeeks(SATURDAY, 3);
    expect(weeks).toHaveLength(3);
    for (const w of weeks) {
      expect(w.days).toHaveLength(6);
      for (const k of w.days) expect(fromKey(k).getDay()).not.toBe(0);
    }
    expect(weeks[2].days[0]).toBe('2026-10-19');
    expect(weeks[2].days[5]).toBe('2026-10-24');
    expect(weeks[0].days[0]).toBe('2026-10-05');
  });

  test('heat levels bucket total sets', () => {
    expect([0, 1, 5, 6, 11, 12, 19, 20, 40].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });

  test('streak survives across a Sunday', () => {
    const active = ['2026-10-23', '2026-10-24', '2026-10-26'];
    expect(computeStreaks(active, MONDAY)).toEqual({ current: 3, longest: 3 });
  });

  test('missing a weekday breaks the streak', () => {
    const active = ['2026-10-20', '2026-10-22', '2026-10-23'];
    expect(computeStreaks(active, fromKey('2026-10-23'))).toEqual({ current: 2, longest: 2 });
  });

  test('today not logged yet keeps the streak from the previous training day', () => {
    const active = ['2026-10-23', '2026-10-24'];
    expect(computeStreaks(active, MONDAY).current).toBe(2);
    expect(computeStreaks(active, SUNDAY).current).toBe(2);
  });

  test('longest streak is tracked separately', () => {
    const active = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-24'];
    expect(computeStreaks(active, SATURDAY)).toEqual({ current: 1, longest: 4 });
  });

  test('training days between skips Sundays', () => {
    expect(trainingDaysBetween(fromKey('2026-10-19'), SUNDAY)).toBe(6);
  });
});

describe('stats', () => {
  const days: DayLog[] = [
    {
      date: '2026-10-19',
      notes: null,
      entries: [
        { muscle: 'chest', exercise: 'Bench', sets: 4, reps: 8, weightKg: 60 },
        { muscle: 'triceps', exercise: null, sets: 3, reps: 12, weightKg: null },
      ],
    },
    { date: '2026-10-13', notes: null, entries: [{ muscle: 'chest', exercise: null, sets: 2, reps: 10, weightKg: 50 }] },
  ];

  test('sets by date, total and per muscle', () => {
    expect(setsByDate(days).get('2026-10-19')).toBe(7);
    expect(setsByDate(days, 'triceps').has('2026-10-13')).toBe(false);
  });

  test('weekly series groups by Monday week', () => {
    const series = weeklySeries(days, SATURDAY, 2, 'chest');
    expect(series.map((p) => p.sets)).toEqual([2, 4]);
    expect(series[1].volume).toBe(4 * 8 * 60);
  });
});
