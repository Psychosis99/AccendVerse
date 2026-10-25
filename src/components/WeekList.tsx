import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { staggered, useProgress } from '../anim/hooks';

export interface WeekRow {
  key: string;
  label: string;
  value: number;
  /** Shown instead of the number when there is nothing logged. */
  empty?: string;
}

/** Ranked rows with inline bars; the best row is a solid lime pill (reference "forecast" list). */
export function WeekList({ rows, best, onPress }: { rows: WeekRow[]; best: number; onPress?: (key: string) => void }) {
  const p = useProgress(rows.map((r) => r.value).join(','), 900, 200, 'outExpo');
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <View style={{ gap: 8 }}>
      {rows.map((r, i) => {
        const on = i === best && r.value > 0;
        const w = (r.value / max) * staggered(p, i, rows.length, 0.5);
        return (
          <Pressable key={r.key} onPress={onPress ? () => onPress(r.key) : undefined} style={[styles.row, on && styles.rowOn]}>
            <Text style={[styles.label, on && { color: colors.onNeon }]}>{r.label}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${w * 100}%` }, on && { backgroundColor: colors.onNeon }]} />
            </View>
            <Text style={[styles.value, on && { color: colors.onNeon }]}>{r.value > 0 ? r.value : r.empty ?? '–'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowOn: {
    backgroundColor: colors.neon,
    borderColor: colors.neon,
    shadowColor: colors.neon,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 6,
  },
  label: { width: 64, fontFamily: fonts.display, fontSize: 14, color: colors.text },
  track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: colors.muted },
  value: { width: 40, textAlign: 'right', fontFamily: fonts.displayMed, fontSize: 13, color: colors.sub, fontVariant: ['tabular-nums'] },
});
