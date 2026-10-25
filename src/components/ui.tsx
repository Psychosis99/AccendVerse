import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { useCountUp, usePulse } from '../anim/hooks';
import { formatNumber } from '../lib/stats';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      {right}
    </View>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  delay = 0,
  style,
}: {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useCountUp(value, 1000, delay);
  return (
    <View style={[styles.stat, style]}>
      <Text style={styles.statValue}>
        {formatNumber(Math.round(v))}
        {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function NeonButton({
  title,
  onPress,
  pulse = false,
  variant = 'solid',
  disabled,
}: {
  title: string;
  onPress: () => void;
  pulse?: boolean;
  variant?: 'solid' | 'outline' | 'danger';
  disabled?: boolean;
}) {
  const p = usePulse(1300, pulse && !disabled);
  const solid = variant === 'solid';
  const tint = variant === 'danger' ? colors.danger : colors.neon;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: solid ? tint : 'transparent',
          borderColor: tint,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
          shadowColor: tint,
          shadowOpacity: solid ? 0.4 + 0.5 * p : 0,
          shadowRadius: 6 + 12 * p,
          elevation: solid ? 4 + 8 * p : 0,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: solid ? colors.bg : tint }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { borderColor: colors.neon, backgroundColor: colors.surfaceHi }]}
    >
      {icon}
      <Text style={[styles.chipText, active && { color: colors.neon }]}>{label}</Text>
    </Pressable>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{title}</Text>
      {hint ? <Text style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}>{hint}</Text> : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  section: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  stat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statValue: { color: colors.neon, fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statSuffix: { color: colors.neonDim, fontSize: 14, fontWeight: '600' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },
  button: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: { fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
});
