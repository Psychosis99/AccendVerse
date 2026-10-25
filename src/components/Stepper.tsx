import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

/** Numeric field with −/+ buttons. `value` null means empty (e.g. no weight). */
export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  decimal = false,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  min?: number;
  decimal?: boolean;
}) {
  const bump = (d: number) => onChange(Math.max(min, Math.round(((value ?? 0) + d) * 100) / 100));
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={() => bump(-step)} hitSlop={6}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          value={value == null ? '' : String(value)}
          placeholder="–"
          placeholderTextColor={colors.muted}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          selectTextOnFocus
          onChangeText={(t) => {
            const cleaned = t.replace(',', '.');
            if (cleaned.trim() === '') return onChange(null);
            const n = decimal ? parseFloat(cleaned) : parseInt(cleaned, 10);
            if (!Number.isNaN(n)) onChange(Math.max(min, n));
          }}
        />
        <Pressable style={styles.btn} onPress={() => bump(step)} hitSlop={6}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center' },
  label: { color: colors.muted, fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 6, fontFamily: fonts.displayMed },
  row: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.surfaceHi },
  btn: { width: 30, height: 42, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.neon, fontSize: 20, fontFamily: fonts.displayMed },
  input: { flex: 1, minWidth: 0, width: '100%', color: colors.text, fontSize: 18, fontFamily: fonts.display, textAlign: 'center', paddingVertical: 4 },
});
