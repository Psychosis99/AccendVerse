import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { differenceInCalendarDays, format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { isMuscleId, muscleName } from '../../data/muscles';
import { fromKey } from '../../lib/calendar';
import { bestSet, formatEntry, lastTrained, setsByDate, totalsByMuscle, weeklySeries } from '../../lib/stats';
import { useToday } from '../../lib/useToday';
import { Heatmap } from '../../components/Heatmap';
import { LineChart } from '../../components/Charts';
import { MuscleIcon } from '../../components/MuscleIcon';
import { EntryRow } from '../../components/EntryRow';
import { Card, Empty, SectionTitle, StatCard } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { router } from 'expo-router';

export default function MuscleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { days } = useData();
  const today = useToday();
  const muscle = isMuscleId(id) ? id : 'chest';

  const sets = useMemo(() => setsByDate(days, muscle), [days, muscle]);
  const total = useMemo(() => totalsByMuscle(days).find((t) => t.muscle === muscle)!, [days, muscle]);
  const best = useMemo(() => bestSet(days, muscle), [days, muscle]);
  const last = lastTrained(days).get(muscle);
  const trend = useMemo(() => weeklySeries(days, today, 12, muscle), [days, today, muscle]);
  const hasWeight = trend.some((p) => p.volume > 0);
  const recent = days.filter((d) => d.entries.some((e) => e.muscle === muscle)).slice(0, 6);

  return (
    <>
      <Stack.Screen options={{ title: muscleName(muscle) }} />
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MuscleIcon muscle={muscle} size={72} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName}>{muscleName(muscle)}</Text>
            <Text style={styles.heroMeta}>
              {last ? `Last trained ${differenceInCalendarDays(today, fromKey(last)) === 0 ? 'today' : `${differenceInCalendarDays(today, fromKey(last))}d ago`}` : 'Not trained yet'}
            </Text>
            {best && (
              <Text style={styles.heroBest}>
                Best set: <Text style={{ color: colors.neon }}>{formatEntry(best)}</Text>
              </Text>
            )}
          </View>
        </View>

        <Card>
          <SectionTitle>{muscleName(muscle)} activity</SectionTitle>
          <Heatmap sets={sets} today={today} onPressDay={(k) => router.push({ pathname: '/day/[date]', params: { date: k } })} />
        </Card>

        <View style={styles.statGrid}>
          <StatCard label="Sessions" value={sets.size} />
          <StatCard label="Total sets" value={total.sets} delay={80} />
          <StatCard label="Total reps" value={total.reps} delay={160} />
          <StatCard label="Volume" value={total.volume} suffix=" kg" delay={240} />
        </View>

        <Card>
          <SectionTitle>{hasWeight ? 'Weekly volume (kg)' : 'Weekly reps'}</SectionTitle>
          <LineChart data={trend.map((p) => ({ label: p.label, value: hasWeight ? p.volume : p.reps }))} />
        </Card>

        <Card>
          <SectionTitle>Recent</SectionTitle>
          {recent.length === 0 && <Empty title="No entries yet" />}
          {recent.map((d) => (
            <View key={d.date} style={{ marginBottom: spacing.sm }}>
              <Text style={styles.recentDate}>{format(fromKey(d.date), 'EEE, d MMM')}</Text>
              {d.entries
                .filter((e) => e.muscle === muscle)
                .map((e, i) => (
                  <EntryRow key={i} entry={e} showMuscle={!e.exercise} />
                ))}
            </View>
          ))}
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.neon,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowColor: colors.neon,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  heroName: { color: colors.neon, fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  heroMeta: { color: colors.muted, marginTop: 2 },
  heroBest: { color: colors.text, marginTop: 6, fontWeight: '700' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  recentDate: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
});
