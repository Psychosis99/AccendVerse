// Web build is only used for UI previews: an in-memory store seeded with demo data,
// exposing the same interface as the SQLite store used on Android.
import type { DayLog } from './types';
import type { Store } from './store';
import { demoDays } from './demo';

export type { Store } from './store';

export async function openStore(): Promise<Store> {
  let days: DayLog[] = demoDays(new Date());
  const clone = (d: DayLog[]) => d.map((x) => ({ ...x, entries: x.entries.map((e) => ({ ...e })) }));

  return {
    async loadAll() {
      return clone(days).sort((a, b) => b.date.localeCompare(a.date));
    },
    async saveDay(day) {
      days = days.filter((d) => d.date !== day.date);
      if (day.entries.length) days.push(clone([day])[0]);
    },
    async deleteDay(date) {
      days = days.filter((d) => d.date !== date);
    },
    async replaceAll(next) {
      days = clone(next);
    },
  };
}
