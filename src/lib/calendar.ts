import { addDays, differenceInCalendarDays, format, startOfWeek } from 'date-fns';

/** Training days are Monday–Saturday. Sunday is a rest day and never shows up or counts. */
export const TRAINING_DAYS_PER_WEEK = 6;
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSunday(d: Date): boolean {
  return d.getDay() === 0;
}

export function weekStart(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 });
}

/** Most recent training day on or before `d` (skips Sunday). */
export function trainingDayOnOrBefore(d: Date): Date {
  return isSunday(d) ? addDays(d, -1) : d;
}

export function previousTrainingDay(d: Date): Date {
  return trainingDayOnOrBefore(addDays(d, -1));
}

export interface HeatWeek {
  monday: Date;
  /** Six keys, Mon..Sat. */
  days: string[];
}

/** The last `count` Mon–Sat weeks, oldest first, ending with the week containing `today`. */
export function heatmapWeeks(today: Date, count: number): HeatWeek[] {
  const current = weekStart(today);
  const weeks: HeatWeek[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const monday = addDays(current, -7 * i);
    const days: string[] = [];
    for (let j = 0; j < TRAINING_DAYS_PER_WEEK; j++) days.push(toKey(addDays(monday, j)));
    weeks.push({ monday, days });
  }
  return weeks;
}

/** Maps total sets in a day to a 0..4 intensity level. */
export function heatLevel(sets: number): number {
  if (sets <= 0) return 0;
  if (sets < 6) return 1;
  if (sets < 12) return 2;
  if (sets < 20) return 3;
  return 4;
}

/** Number of training days (Mon–Sat) in [from, to], inclusive. */
export function trainingDaysBetween(from: Date, to: Date): number {
  let n = 0;
  for (let d = from; differenceInCalendarDays(to, d) >= 0; d = addDays(d, 1)) {
    if (!isSunday(d)) n++;
  }
  return n;
}

/**
 * Streaks count consecutive training days (Mon–Sat). Sundays are skipped, so they
 * neither break nor extend a streak. If today has no workout yet, the current streak
 * still counts up to the previous training day.
 */
export function computeStreaks(activeKeys: Iterable<string>, today: Date): { current: number; longest: number } {
  const active = new Set(activeKeys);
  if (active.size === 0) return { current: 0, longest: 0 };

  let cursor = trainingDayOnOrBefore(today);
  if (!active.has(toKey(cursor))) cursor = previousTrainingDay(cursor);
  let current = 0;
  while (active.has(toKey(cursor))) {
    current++;
    cursor = previousTrainingDay(cursor);
  }

  const sorted = [...active].filter((k) => !isSunday(fromKey(k))).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = fromKey(key);
    run = prev && toKey(previousTrainingDay(d)) === toKey(prev) ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest: Math.max(longest, current) };
}
