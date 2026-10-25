import { StyleSheet, Text, View } from 'react-native';
import type { Entry } from '../data/types';
import { muscleName } from '../data/muscles';
import { formatNumber } from '../lib/stats';
import { colors, fonts, radius, spacing } from '../theme';
import { MuscleIcon } from './MuscleIcon';

/** Read-only row: [icon] Muscle / exercise ........ 4 × 10  60kg */
export function EntryRow({ entry, showMuscle = true, last }: { entry: Entry; showMuscle?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={styles.iconBox}>
        <MuscleIcon muscle={entry.muscle} size={26} />
      </View>
      <View style={{ flex: 1 }}>
        {showMuscle && <Text style={styles.muscle}>{muscleName(entry.muscle)}</Text>}
        {entry.exercise ? <Text style={styles.exercise}>{entry.exercise}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.numbers}>
          {entry.sets}
          <Text style={styles.times}> × </Text>
          {entry.reps}
        </Text>
        {entry.weightKg ? <Text style={styles.weight}>{formatNumber(entry.weightKg)} kg</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscle: { color: colors.text, fontFamily: fonts.display, fontSize: 15 },
  exercise: { color: colors.muted, fontSize: 12, fontFamily: fonts.body, marginTop: 1 },
  numbers: { color: colors.neon, fontFamily: fonts.display, fontSize: 17, fontVariant: ['tabular-nums'] },
  times: { color: colors.muted, fontFamily: fonts.displayMed, fontSize: 13 },
  weight: { color: colors.sub, fontFamily: fonts.displayMed, fontSize: 11, marginTop: 1 },
});
