import { StyleSheet, Text, View } from 'react-native';
import type { Entry } from '../data/types';
import { muscleName } from '../data/muscles';
import { formatEntry } from '../lib/stats';
import { colors, spacing } from '../theme';
import { MuscleIcon } from './MuscleIcon';

/** Read-only row: [icon] Muscle / exercise ........ 4 × 10 @ 60kg */
export function EntryRow({ entry, showMuscle = true }: { entry: Entry; showMuscle?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <MuscleIcon muscle={entry.muscle} size={26} />
      </View>
      <View style={{ flex: 1 }}>
        {showMuscle && <Text style={styles.muscle}>{muscleName(entry.muscle)}</Text>}
        {entry.exercise ? <Text style={styles.exercise}>{entry.exercise}</Text> : null}
      </View>
      <Text style={styles.numbers}>{formatEntry(entry)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscle: { color: colors.text, fontWeight: '700' },
  exercise: { color: colors.muted, fontSize: 12 },
  numbers: { color: colors.neon, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
