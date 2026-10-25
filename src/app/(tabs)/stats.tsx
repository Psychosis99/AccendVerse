import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { addDays, differenceInCalendarWeeks } from 'date-fns';
import { useData } from '../../data/DataContext';
import { MUSCLES, muscleName } from '../../data/muscles';
import type { MuscleId } from '../../data/types';
import { fromKey, toKey, weekStart } from '../../lib/calendar';
import { formatNumber, inRange, totalsByMuscle, weeklySeries } from '../../lib/stats';
import { useToday } from '../../lib/useToday';
import { BarChart, Donut, LineChart } from '../../components/Charts';
import { MuscleIcon } from '../../components/MuscleIcon';
import { Card, Chip, SectionTitle, StatCard } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { staggered, useProgress } from '../../anim/hooks';

const RANGES = [
  { label: '4W', weeks: 4 },
  { label: '12W', weeks: 12 },
  { label: 'All', weeks: 0 },
];

export default function Stats() {
  const { days } = useData();
  const today = useToday();
  const [range, setRange] = useState(1);
  const [trendMuscle, setTrendMuscle] = useState<MuscleId>('chest');

  const oldest = days.length ? fromKey(days[days.length - 1].date) : today;
  const weeks = RANGES[range].weeks || Math.max(4, differenceInCalendarWeeks(today, oldest, { weekStartsOn: 1 }) + 1);
  const fromKeyStr = toKey(addDays(weekStart(today), -7 * (weeks - 1)));
  const scoped = useMemo(() => inRange(days, fromKeyStr, toKey(today)), [days, fromKeyStr, today]);

  const totals = useMemo(() => totalsByMuscle(scoped), [scoped]);
  const sumSets = totals.reduce((s, t) => s + t.sets, 0);
  const sumReps = totals.reduce((s, t) => s + t.reps, 0);
  const sumVolume = totals.reduce((s, t) => s + t.volume, 0);
  const weekly = useMemo(() => weeklySeries(days, today, weeks), [days, today, weeks]);
  const trend = useMemo(() => weeklySeries(days, today, weeks, trendMuscle), [days, today, weeks, trendMuscle]);
  const trendHasWeight = trend.some((p) => p.volume > 0);
  const ranked = [...totals].sort((a, b) => b.sets - a.sets);
  const maxSets = Math.max(1, ...ranked.map((t) => t.sets));
  const p = useProgress(`${range}-${days.length}`, 900, 100, 'outExpo');

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <View style={styles.toggle}>
        {RANGES.map((r, i) => (
          <Pressable key={r.label} style={[styles.toggleBtn, i === range && styles.toggleOn]} onPress={() => setRange(i)}>
            <Text style={[styles.toggleText, i === range && { color: colors.bg }]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statGrid}>
        <StatCard label="Workouts" value={scoped.length} />
        <StatCard label="Total sets" value={sumSets} delay={80} />
        <StatCard label="Total reps" value={sumReps} delay={160} />
        <StatCard label="Volume" value={sumVolume} suffix=" kg" delay={240} />
      </View>

      <Card>
        <SectionTitle>Sets per week</SectionTitle>
        <BarChart data={weekly.map((w) => ({ label: w.label, value: w.sets }))} />
      </Card>

      <Card>
        <SectionTitle>Muscle split</SectionTitle>
        <Donut data={totals.map((t) => ({ label: muscleName(t.muscle), value: t.sets }))} center={{ value: formatNumber(sumSets), label: 'sets' }} />
      </Card>

      <Card>
        <SectionTitle>Per muscle</SectionTitle>
        {ranked.map((t, i) => (
          <Pressable key={t.muscle} style={styles.muscleRow} onPress={() => router.push({ pathname: '/muscle/[id]', params: { id: t.muscle } })}>
            <View style={styles.iconBox}>
              <MuscleIcon muscle={t.muscle} size={24} active={t.sets > 0} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.muscleTop}>
                <Text style={styles.muscleName}>{muscleName(t.muscle)}</Text>
                <Text style={styles.muscleNums}>
                  <Text style={{ color: colors.neon, fontWeight: '800' }}>{t.sets}</Text> sets · {formatNumber(t.reps)} reps
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(t.sets / maxSets) * 100 * staggered(p, i, ranked.length, 0.5)}%` }]} />
              </View>
            </View>
          </Pressable>
        ))}
      </Card>

      <Card>
        <SectionTitle>{trendHasWeight ? 'Volume trend (kg)' : 'Reps trend'}</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: spacing.md }}>
          {MUSCLES.map((m) => (
            <Chip
              key={m.id}
              label={m.name}
              active={m.id === trendMuscle}
              onPress={() => setTrendMuscle(m.id)}
              icon={<MuscleIcon muscle={m.id} size={18} active={m.id === trendMuscle} />}
            />
          ))}
        </ScrollView>
        <LineChart data={trend.map((w) => ({ label: w.label, value: trendHasWeight ? w.volume : w.reps }))} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40 },
  toggle: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 3, marginBottom: spacing.md, backgroundColor: colors.surface },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  toggleOn: { backgroundColor: colors.neon },
  toggleText: { color: colors.muted, fontWeight: '800', letterSpacing: 1 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  muscleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 7 },
  iconBox: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muscleTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  muscleName: { color: colors.text, fontWeight: '700' },
  muscleNums: { color: colors.muted, fontSize: 12 },
  track: { height: 6, backgroundColor: colors.heat[0], borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.neon, borderRadius: 3 },
});
