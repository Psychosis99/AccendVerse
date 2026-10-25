import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing, type } from '../theme';
import { useCountUp, usePulse } from '../anim/hooks';
import { formatNumber } from '../lib/stats';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Overline + large title, with an optional pill on the right (as in the reference flow). */
export function ScreenHeader({ overline, title, right }: { overline: string; title: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <Text style={type.overline}>{overline}</Text>
      <View style={styles.headerRow}>
        <Text style={[type.title, { flex: 1 }]}>{title}</Text>
        {right}
      </View>
    </View>
  );
}

export function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.pill, active && { backgroundColor: colors.neon, borderColor: colors.neon }]}>
      <Text style={[styles.pillText, active && { color: colors.onNeon }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={type.label}>{children}</Text>
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
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}) {
  const v = useCountUp(value, 1000, delay);
  return (
    <View style={[styles.stat, style]}>
      <Text style={type.label}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: colors.neon }]} numberOfLines={1}>
        {formatNumber(Math.round(v))}
        {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
      </Text>
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
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: solid ? tint : 'transparent',
          borderColor: solid ? tint : variant === 'danger' ? 'rgba(255,90,110,0.45)' : colors.borderHi,
          opacity: disabled ? 0.35 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: tint,
          shadowOpacity: solid ? 0.25 + 0.45 * p : 0,
          shadowRadius: 8 + 14 * p,
          elevation: solid ? 3 + 7 * p : 0,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: solid ? colors.onNeon : tint }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.chip, active && { borderColor: colors.neon, backgroundColor: 'rgba(184,255,59,0.08)' }]}>
      {icon}
      <Text style={[styles.chipText, active && { color: colors.neon }]}>{label}</Text>
    </Pressable>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      <Text style={type.h3}>{title}</Text>
      {hint ? <Text style={[type.small, { marginTop: 4, textAlign: 'center' }]}>{hint}</Text> : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopColor: colors.borderHi,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg + 2,
    marginBottom: spacing.md,
  },
  header: { marginBottom: spacing.lg, gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: { fontFamily: fonts.bodyMed, fontSize: 11, color: colors.sub },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  stat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopColor: colors.borderHi,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: 6,
  },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.text, fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  statSuffix: { fontFamily: fonts.displayMed, fontSize: 13, color: colors.muted, letterSpacing: 0 },
  button: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.bodyMed, color: colors.sub, fontSize: 13 },
});
