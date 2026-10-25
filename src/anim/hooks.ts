import { useEffect, useRef, useState } from 'react';
import { animate } from './anime';

/** Counts up from 0 (or the previous value) to `target` using an anime.js tween. */
export function useCountUp(target: number, duration = 900, delay = 0): number {
  const [value, setValue] = useState(0);
  const state = useRef({ v: 0 });

  useEffect(() => {
    const anim = animate(state.current, {
      v: target,
      duration,
      delay,
      ease: 'outExpo',
      onUpdate: () => setValue(state.current.v),
    });
    return () => {
      anim.pause();
    };
  }, [target, duration, delay]);

  return value;
}

/** A 0 → 1 progress value driven by anime.js; restarts whenever `key` changes. */
export function useProgress(key: unknown, duration = 1000, delay = 0, ease = 'outQuart'): number {
  const [p, setP] = useState(0);

  useEffect(() => {
    const obj = { p: 0 };
    setP(0);
    const anim = animate(obj, {
      p: 1,
      duration,
      delay,
      ease,
      onUpdate: () => setP(obj.p),
    });
    return () => {
      anim.pause();
    };
  }, [key, duration, delay, ease]);

  return p;
}

/** A continuous 0 ↔ 1 ping-pong value (for glow pulses). */
export function usePulse(duration = 1400, enabled = true): number {
  const [p, setP] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const obj = { p: 0 };
    const anim = animate(obj, {
      p: 1,
      duration,
      loop: true,
      alternate: true,
      ease: 'inOutSine',
      onUpdate: () => setP(obj.p),
    });
    return () => {
      anim.pause();
    };
  }, [duration, enabled]);

  return p;
}

/** Stagger helper: maps overall progress (0..1) to an item's own eased 0..1 progress. */
export function staggered(progress: number, index: number, count: number, spread = 0.6): number {
  if (count <= 1) return progress;
  const start = (index / (count - 1)) * spread;
  const t = (progress - start) / (1 - spread);
  return Math.max(0, Math.min(1, t));
}
