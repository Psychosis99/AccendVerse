import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { differenceInCalendarDays, endOfMonth, startOfMonth } from 'date-fns';
import { useData } from '../../data/DataContext';
import { MUSCLES } from '../../data/muscles';
import { computeStreaks, fromKey, isSunday, toKey, TRAINING_DAYS_PER_WEEK, weekStart } from '../../lib/calendar';
import { inRange, lastTrained, setsByDate, weeklySeries } from '../../lib/stats';
import { useToday } from '../../lib/useToday';
import { Heatmap } from '../../components/Heatmap';
import { MuscleIcon } from '../../components/MuscleIcon';
import { BarChart } from '../../components/Charts';
import { EntryRow } from '../../components/EntryRow';
import { Card, Empty, NeonButton, SectionTitle, StatCard } from '../../components/ui';
import { colors, spacing } from '../../theme';
import { format } from 'date-fns';

export default function Dashboard() {
  const { days } = useData();
  const today = useToday();
  const todayKey = toKey(today);

  const sets = useMemo(() => setsByDate(days), [days]);
  const streaks = useMemo(() => computeStreaks(sets.keys(), today), [sets, today]);
  const weekKey = toKey(weekStart(today));
  const thisWeek = useMemo(() => inRange(days, weekKey, todayKey), [days, weekKey, todayKey]);
  const monthSets = useMemo(
    () => inRange(days, toKey(startOfMonth(today)), toKey(endOfMonth(today))).reduce((s, d) => s + d.entries.reduce((a, e) => a + e.sets, 0), 0),
    [days, today],
  );
  const trainedThisWeek = new Set(thisWeek.flatMap((d) => d.entries.map((e) => e.muscle)));
  const last = useMemo(() => lastTrained(days), [days]);
  const neglected = MUSCLES.map((m) => {
    const k = last.get(m.id);
    return { ...m, since: k ? differenceInCalendarDays(today, fromKey(k)) : null };
  })
    .filter((m) => m.since === null || m.since >= 7)
    .sort((a, b) => (b.since ?? 999) - (a.since ?? 999));
  const weekly = useMemo(() => weeklySeries(days, today, 10).map((p) => ({ label: p.label, value: p.sets })), [days, today]);
  const latest = days[0];
  const workouts6mo = useMemo(() => [...sets.keys()].filter((k) => differenceInCalendarDays(today, fromKey(k)) < 182).length, [sets, today]);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Card>
        <SectionTitle right={<Text style={styles.meta}>{workouts6mo} workouts · 6 mo</Text>}>Activity</SectionTitle>
        <Heatmap sets={sets} today={today} onPressDay={(k) => router.push({ pathname: '/day/[date]', params: { date: k } })} />
      </Card>

      <View style={styles.statGrid}>
        <StatCard label="Current streak" value={streaks.current} suffix=" days" />
        <StatCard label="Longest streak" value={streaks.longest} suffix=" days" delay={80} />
        <StatCard label="This week" value={thisWeek.length} suffix={` / ${TRAINING_DAYS_PER_WEEK}`} delay={160} />
        <StatCard label={`Sets in ${format(today, 'MMMM')}`} value={monthSets} delay={240} />
      </View>

      <Card>
        <SectionTitle>Muscles this week</SectionTitle>
        <View style={styles.muscleGrid}>
          {MUSCLES.map((m) => {
            const on = trainedThisWeek.has(m.id);
            return (
              <Pressable key={m.id} style={styles.muscleCell} onPress={() => router.push({ pathname: '/muscle/[id]', params: { id: m.id } })}>
                <View style={[styles.muscleIconBox, on && styles.muscleIconOn]}>
                  <MuscleIcon muscle={m.id} size={30} active={on} />
                </View>
                <Text style={[styles.muscleLabel, on && { color: colors.neon }]} numberOfLines={1}>
                  {m.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {neglected.length > 0 && (
          <Text style={styles.hint}>
            <Text style={{ color: colors.neon, fontWeight: '800' }}>Needs work: </Text>
            {neglected
              .slice(0, 4)
              .map((m) => `${m.name}${m.since === null ? ' (never)' : ` (${m.since}d)`}`)
              .join(' · ')}
          </Text>
        )}
      </Card>

      <Card>
        <SectionTitle>Weekly sets</SectionTitle>
        <BarChart data={weekly} />
      </Card>

      <Card>
        <SectionTitle right={latest ? <Text style={styles.meta}>{format(fromKey(latest.date), 'EEE, d MMM')}</Text> : undefined}>
          Last workout
        </SectionTitle>
        {latest ? (
          <Pressable onPress={() => router.push({ pathname: '/day/[date]', params: { date: latest.date } })}>
            {latest.entries.map((e, i) => (
              <EntryRow key={i} entry={e} />
            ))}
          </Pressable>
        ) : (
          <Empty title="No workouts yet" hint="Log your first session to light up the grid." />
        )}
      </Card>

      {isSunday(today) ? (
        <NeonButton title="Rest day · log Saturday" variant="outline" onPress={() => router.push('/log')} />
      ) : (
        <NeonButton title={sets.has(todayKey) ? "Edit today's workout" : "Log today's workout"} pulse={!sets.has(todayKey)} onPress={() => router.push('/log')} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40 },
  meta: { color: colors.muted, fontSize: 11 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  muscleCell: { width: '25%', alignItems: 'center', gap: 4 },
  muscleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleIconOn: { borderColor: colors.neon, shadowColor: colors.neon, shadowOpacity: 0.6, shadowRadius: 8, elevation: 4 },
  muscleLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 12, marginTop: spacing.lg, lineHeight: 18 },
});
