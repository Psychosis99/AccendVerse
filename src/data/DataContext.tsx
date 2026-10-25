import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DayLog } from './types';
import { openStore, type Store } from './store';

interface DataState {
  ready: boolean;
  days: DayLog[];
  getDay(date: string): DayLog | undefined;
  saveDay(day: DayLog): Promise<void>;
  deleteDay(date: string): Promise<void>;
  replaceAll(days: DayLog[]): Promise<void>;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [days, setDays] = useState<DayLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await openStore();
      const all = await s.loadAll();
      if (!cancelled) {
        setDays(all);
        setStore(s);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = useCallback(async (s: Store) => setDays(await s.loadAll()), []);

  const value = useMemo<DataState>(
    () => ({
      ready: store !== null,
      days,
      getDay: (date) => days.find((d) => d.date === date),
      saveDay: async (day) => {
        await store!.saveDay(day);
        await reload(store!);
      },
      deleteDay: async (date) => {
        await store!.deleteDay(date);
        await reload(store!);
      },
      replaceAll: async (next) => {
        await store!.replaceAll(next);
        await reload(store!);
      },
    }),
    [store, days, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
