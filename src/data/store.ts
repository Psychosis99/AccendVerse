import * as SQLite from 'expo-sqlite';
import type { DayLog, Entry } from './types';
import { isMuscleId } from './muscles';

export interface Store {
  loadAll(): Promise<DayLog[]>;
  /** Replaces everything logged for `day.date`. A day with no entries is deleted. */
  saveDay(day: DayLog): Promise<void>;
  deleteDay(date: string): Promise<void>;
  replaceAll(days: DayLog[]): Promise<void>;
}

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  muscle TEXT NOT NULL,
  exercise TEXT,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg REAL
);
CREATE INDEX IF NOT EXISTS idx_entries_workout ON entries(workout_id);
`;

interface Row {
  id: number;
  date: string;
  notes: string | null;
  entry_id: number | null;
  muscle: string | null;
  exercise: string | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
}

export async function openStore(): Promise<Store> {
  const db = await SQLite.openDatabaseAsync('accendverse.db');
  await db.execAsync(SCHEMA);

  async function writeDay(day: DayLog) {
    await db.runAsync('DELETE FROM workouts WHERE date = ?', day.date);
    if (day.entries.length === 0) return;
    const res = await db.runAsync('INSERT INTO workouts (date, notes) VALUES (?, ?)', day.date, day.notes);
    for (const e of day.entries) {
      await db.runAsync(
        'INSERT INTO entries (workout_id, muscle, exercise, sets, reps, weight_kg) VALUES (?, ?, ?, ?, ?, ?)',
        res.lastInsertRowId,
        e.muscle,
        e.exercise,
        e.sets,
        e.reps,
        e.weightKg,
      );
    }
  }

  return {
    async loadAll() {
      const rows = await db.getAllAsync<Row>(
        `SELECT w.id, w.date, w.notes, e.id AS entry_id, e.muscle, e.exercise, e.sets, e.reps, e.weight_kg
         FROM workouts w LEFT JOIN entries e ON e.workout_id = w.id
         ORDER BY w.date DESC, e.id ASC`,
      );
      const byDate = new Map<string, DayLog>();
      for (const r of rows) {
        let day = byDate.get(r.date);
        if (!day) {
          day = { date: r.date, notes: r.notes, entries: [] };
          byDate.set(r.date, day);
        }
        if (r.entry_id != null && isMuscleId(r.muscle)) {
          const entry: Entry = {
            id: r.entry_id,
            muscle: r.muscle,
            exercise: r.exercise,
            sets: r.sets ?? 0,
            reps: r.reps ?? 0,
            weightKg: r.weight_kg,
          };
          day.entries.push(entry);
        }
      }
      return [...byDate.values()];
    },
    async saveDay(day) {
      await db.withTransactionAsync(() => writeDay(day));
    },
    async deleteDay(date) {
      await db.runAsync('DELETE FROM workouts WHERE date = ?', date);
    },
    async replaceAll(days) {
      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM workouts');
        for (const day of days) await writeDay(day);
      });
    },
  };
}
