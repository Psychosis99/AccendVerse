import { addDays } from 'date-fns';
import type { DayLog, Entry, MuscleId } from './types';
import { isSunday, toKey } from '../lib/calendar';

// Push / pull / legs split used to generate believable sample data for previews.
const SPLIT: { muscle: MuscleId; exercise: string; weight: number | null }[][] = [
  [
    { muscle: 'chest', exercise: 'Bench Press', weight: 60 },
    { muscle: 'shoulders', exercise: 'Overhead Press', weight: 35 },
    { muscle: 'triceps', exercise: 'Rope Pushdown', weight: 25 },
  ],
  [
    { muscle: 'back', exercise: 'Barbell Row', weight: 55 },
    { muscle: 'biceps', exercise: 'Dumbbell Curl', weight: 12 },
    { muscle: 'forearms', exercise: 'Wrist Curl', weight: 10 },
  ],
  [
    { muscle: 'quads', exercise: 'Back Squat', weight: 80 },
    { muscle: 'hamstrings', exercise: 'Romanian Deadlift', weight: 70 },
    { muscle: 'glutes', exercise: 'Hip Thrust', weight: 90 },
    { muscle: 'calves', exercise: 'Calf Raise', weight: 40 },
    { muscle: 'core', exercise: 'Hanging Leg Raise', weight: null },
  ],
];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function demoDays(today: Date, weeks = 16): DayLog[] {
  const rand = rng(42);
  const days: DayLog[] = [];
  const start = addDays(today, -7 * weeks);
  let splitIndex = 0;
  for (let d = start; d <= today; d = addDays(d, 1)) {
    if (isSunday(d)) continue;
    const progress = (d.getTime() - start.getTime()) / (today.getTime() - start.getTime());
    // Skip some days; consistency improves over time.
    if (rand() > 0.55 + progress * 0.35) continue;
    const plan = SPLIT[splitIndex++ % SPLIT.length];
    const entries: Entry[] = plan
      .filter(() => rand() > 0.12)
      .map((p) => ({
        muscle: p.muscle,
        exercise: p.exercise,
        sets: 3 + Math.floor(rand() * 3),
        reps: 6 + Math.floor(rand() * 7),
        weightKg: p.weight == null ? null : Math.round((p.weight * (0.85 + progress * 0.3)) / 2.5) * 2.5,
      }));
    if (entries.length) days.push({ date: toKey(d), notes: null, entries });
  }
  return days;
}
