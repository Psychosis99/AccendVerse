import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { toKey } from './calendar';

/** Today's date, refreshed whenever the screen regains focus (so it rolls over at midnight). */
export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setToday((prev) => {
        const now = new Date();
        return toKey(now) === toKey(prev) ? prev : now;
      });
    }, []),
  );
  return today;
}
