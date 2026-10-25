import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { differenceInCalendarDays, format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { isMuscleId, muscleName } from '../../data/muscles';
import { fromKey } from '../../lib/calendar';
import { bestSet, formatNumber, lastTrained, setsByDate, totalsByMuscle, weeklySeries } from '../../lib/stats';
import { useToday } from '../../lib/useToday';
import { Heatmap } from '../../components/Heatmap';
import { LineChart } from '../../components/Charts';
import { MuscleIcon } from '../../components/MuscleIcon';
import { EntryRow } from '../../components/EntryRow';
import { Card, Empty, Pill, ScreenHeader, SectionTitle, StatCard } from '../../components/ui';
import { colors, fonts, radius, spacing, type } from '../../theme';

export default function MuscleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { days } = useData();
  const today = useToday();
  const muscle = isMuscleId(id) ? id : 'chest';

  const sets = useMemo(() => setsByDate(days, muscle), [days, muscle]);
  const total = useMemo(() => totalsByMuscle(days).find((t) => t.muscle === muscle)!, [days, muscle]);
  const best = useMemo(() => bestSet(days, muscle), [days, muscle]);
  const last = lastTrained(days).get(muscle);
  const since = last ? differenceInCalendarDays(today, fromKey(last)) : null;
  const trend = useMemo(() => weeklySeries(days, today, 12, muscle), [days, today, muscle]);
  const hasWeight = trend.some((p) => p.volume > 0);
  const recent = days.filter((d) => d.entries.some((e) => e.muscle === muscle)).slice(0, 6);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <ScreenHeader
        overline={`Muscle · ${since === null ? 'not trained yet' : since === 0 ? 'trained today' : `last trained ${since}d ago`}`}
        title={muscleName(muscle)}
        right={<Pill label={since !== null && since < 7 ? 'On track' : 'Needs work'} active={since !== null && since < 7} />}
      />

      <Card style={styles.hero}>
        <View style={styles.heroIcon}>
          <MuscleIcon muscle={muscle} size={78} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={type.label}>Best set</Text>
          {best ? (
            <>
              <Text style={styles.heroNum}>
                {best.weightKg ? formatNumber(best.weightKg) : best.reps}
                <Text style={styles.heroUnit}>{best.weightKg ? ' kg' : ' reps'}</Text>
              </Text>
              <Text style={styles.heroSub}>
                {best.sets} × {best.reps} · {format(fromKey(best.date), 'MMM d')}
              </Text>
            </>
          ) : (
            <Text style={styles.heroNum}>—</Text>
          )}
        </View>
      </Card>

      <View style={styles.statGrid}>
        <StatCard label="Sessions" value={sets.size} accent />
        <StatCard label="Total sets" value={total.sets} delay={80} />
        <StatCard label="Total reps" value={total.reps} delay={160} />
        <StatCard label="Volume" value={total.volume} suffix=" kg" delay={240} />
      </View>

      <Card>
        <SectionTitle>{`${muscleName(muscle)} activity`}</SectionTitle>
        <Heatmap sets={sets} today={today} onPressDay={(k) => router.push({ pathname: '/day/[date]', params: { date: k } })} />
      </Card>

      <Card>
        <SectionTitle right={<Text style={type.small}>12 weeks</Text>}>{hasWeight ? 'Weekly volume · kg' : 'Weekly reps'}</SectionTitle>
        <LineChart data={trend.map((p) => ({ label: p.label, value: hasWeight ? p.volume : p.reps }))} />
      </Card>

      <Card>
        <SectionTitle>Recent</SectionTitle>
        {recent.length === 0 && <Empty title="No entries yet" />}
        {recent.map((d) => {
          const list = d.entries.filter((e) => e.muscle === muscle);
          return (
            <View key={d.date} style={{ marginBottom: spacing.sm }}>
              <Text style={[type.label, { marginTop: 6 }]}>{format(fromKey(d.date), 'EEE, d MMM')}</Text>
              {list.map((e, i) => (
                <EntryRow key={i} entry={e} showMuscle={!e.exercise} last={i === list.length - 1} />
              ))}
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroIcon: {
    width: 104,
    height: 104,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184,255,59,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(184,255,59,0.45)',
  },
  heroNum: { fontFamily: fonts.display, fontSize: 44, color: colors.text, letterSpacing: -1.5, lineHeight: 50 },
  heroUnit: { fontFamily: fonts.displayMed, fontSize: 16, color: colors.muted, letterSpacing: 0 },
  heroSub: { fontFamily: fonts.display, fontSize: 14, color: colors.neon },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
});
