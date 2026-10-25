import type { MuscleId } from './types';

export interface MuscleGroup {
  id: MuscleId;
  name: string;
}

export const MUSCLES: MuscleGroup[] = [
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'forearms', name: 'Forearms' },
  { id: 'core', name: 'Core' },
  { id: 'quads', name: 'Quads' },
  { id: 'hamstrings', name: 'Hamstrings' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'calves', name: 'Calves' },
];

export const MUSCLE_IDS = MUSCLES.map((m) => m.id);

export function muscleName(id: MuscleId): string {
  return MUSCLES.find((m) => m.id === id)?.name ?? id;
}

export function isMuscleId(v: unknown): v is MuscleId {
  return typeof v === 'string' && (MUSCLE_IDS as string[]).includes(v);
}
