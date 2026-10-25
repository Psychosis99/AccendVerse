export type MuscleId =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves';

export interface Entry {
  id?: number;
  muscle: MuscleId;
  exercise: string | null;
  sets: number;
  reps: number;
  weightKg: number | null;
}

/** One logged workout day. `date` is a local 'YYYY-MM-DD' key. */
export interface DayLog {
  date: string;
  notes: string | null;
  entries: Entry[];
}

export interface Backup {
  app: 'AccendVerse';
  version: 1;
  exportedAt: string;
  days: DayLog[];
}
