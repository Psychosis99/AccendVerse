import { addDays, format } from 'date-fns';
import type { DayLog, Entry, MuscleId } from '../data/types';
import { MUSCLES } from '../data/muscles';
import { toKey, weekStart } from './calendar';

export const entryReps = (e: Entry) => e.sets * e.reps;
export const entryVolume = (e: Entry) => e.sets * e.reps * (e.weightKg ?? 0);

export function daySets(day: DayLog, muscle?: MuscleId): number {
  return day.entries.reduce((s, e) => (muscle && e.muscle !== muscle ? s : s + e.sets), 0);
}

/** date key -> total sets, optionally for one muscle. Days with 0 sets are omitted. */
export function setsByDate(days: DayLog[], muscle?: MuscleId): Map<string, number> {
  const map = new Map<string, number>();
  for (const day of days) {
    const sets = daySets(day, muscle);
    if (sets > 0) map.set(day.date, sets);
  }
  return map;
}

export function inRange(days: DayLog[], fromKey: string, toKeyInclusive: string): DayLog[] {
  return days.filter((d) => d.date >= fromKey && d.date <= toKeyInclusive);
}

export interface MuscleTotal {
  muscle: MuscleId;
  sets: number;
  reps: number;
  volume: number;
}

export function totalsByMuscle(days: DayLog[]): MuscleTotal[] {
  const totals = new Map<MuscleId, MuscleTotal>(
    MUSCLES.map((m) => [m.id, { muscle: m.id, sets: 0, reps: 0, volume: 0 }]),
  );
  for (const day of days) {
    for (const e of day.entries) {
      const t = totals.get(e.muscle)!;
      t.sets += e.sets;
      t.reps += entryReps(e);
      t.volume += entryVolume(e);
    }
  }
  return [...totals.values()];
}

export interface WeekPoint {
  label: string;
  weekKey: string;
  sets: number;
  reps: number;
  volume: number;
}

/** Weekly totals for the last `weeks` weeks (oldest first), optionally for one muscle. */
export function weeklySeries(days: DayLog[], today: Date, weeks: number, muscle?: MuscleId): WeekPoint[] {
  const current = weekStart(today);
  const points: WeekPoint[] = [];
  const index = new Map<string, WeekPoint>();
  for (let i = weeks - 1; i >= 0; i--) {
    const monday = addDays(current, -7 * i);
    const p = { label: format(monday, 'd MMM'), weekKey: toKey(monday), sets: 0, reps: 0, volume: 0 };
    points.push(p);
    index.set(p.weekKey, p);
  }
  for (const day of days) {
    const [y, m, d] = day.date.split('-').map(Number);
    const p = index.get(toKey(weekStart(new Date(y, m - 1, d))));
    if (!p) continue;
    for (const e of day.entries) {
      if (muscle && e.muscle !== muscle) continue;
      p.sets += e.sets;
      p.reps += entryReps(e);
      p.volume += entryVolume(e);
    }
  }
  return points;
}

/** muscle -> most recent date key trained. */
export function lastTrained(days: DayLog[]): Map<MuscleId, string> {
  const map = new Map<MuscleId, string>();
  for (const day of days) {
    for (const e of day.entries) {
      const prev = map.get(e.muscle);
      if (!prev || day.date > prev) map.set(e.muscle, day.date);
    }
  }
  return map;
}

/** Heaviest set for a muscle (by weight, then reps). */
export function bestSet(days: DayLog[], muscle: MuscleId): (Entry & { date: string }) | null {
  let best: (Entry & { date: string }) | null = null;
  for (const day of days) {
    for (const e of day.entries) {
      if (e.muscle !== muscle) continue;
      const w = e.weightKg ?? 0;
      const bw = best?.weightKg ?? 0;
      if (!best || w > bw || (w === bw && e.reps > best.reps)) best = { ...e, date: day.date };
    }
  }
  return best;
}

export function formatEntry(e: Entry): string {
  const base = `${e.sets} × ${e.reps}`;
  return e.weightKg ? `${base} @ ${formatNumber(e.weightKg)}kg` : base;
}

export function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
