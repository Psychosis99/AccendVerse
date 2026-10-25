import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { addDays, differenceInCalendarDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { useData } from '../../data/DataContext';
import { MUSCLES } from '../../data/muscles';
import { computeStreaks, fromKey, isSunday, toKey, TRAINING_DAYS_PER_WEEK, weekStart } from '../../lib/calendar';
import { inRange, lastTrained, setsByDate, weeklySeries } from '../../lib/stats';
import { useToday } from '../../lib/useToday';
import { useCountUp } from '../../anim/hooks';
import { Heatmap } from '../../components/Heatmap';
import { Gauge } from '../../components/Gauge';
import { HatchBars } from '../../components/HatchBars';
import { WeekList } from '../../components/WeekList';
import { MuscleIcon } from '../../components/MuscleIcon';
import { EntryRow } from '../../components/EntryRow';
import { Card, Empty, NeonButton, Pill, ScreenHeader, SectionTitle, StatCard } from '../../components/ui';
import { colors, fonts, radius, spacing, type } from '../../theme';

export default function Dashboard() {
  const { days } = useData();
  const today = useToday();
  const todayKey = toKey(today);
  const monday = weekStart(today);

  const sets = useMemo(() => setsByDate(days), [days]);
  const streaks = useMemo(() => computeStreaks(sets.keys(), today), [sets, today]);
  const thisWeek = useMemo(() => inRange(days, toKey(monday), todayKey), [days, monday, todayKey]);
  const monthSets = useMemo(
    () => inRange(days, toKey(startOfMonth(today)), toKey(endOfMonth(today))).reduce((s, d) => s + d.entries.reduce((a, e) => a + e.sets, 0), 0),
    [days, today],
  );

  // Mon–Sat of the current week.
  const week = Array.from({ length: TRAINING_DAYS_PER_WEEK }, (_, i) => {
    const d = addDays(monday, i);
    const key = toKey(d);
    return { key, d, sets: sets.get(key) ?? 0 };
  });
  const bestIdx = week.reduce((b, w, i) => (w.sets > week[b].sets ? i : b), 0);
  const todayIdx = isSunday(today) ? -1 : week.findIndex((w) => w.key === todayKey);
  const focusIdx = todayIdx >= 0 && week[todayIdx].sets > 0 ? todayIdx : bestIdx;
  const focus = week[focusIdx];

  const headline =
    week[bestIdx].sets === 0
      ? 'A fresh week to climb.'
      : bestIdx === todayIdx
        ? 'Today rises above the week.'
        : `${format(week[bestIdx].d, 'EEEE')} rises above the week.`;

  const weeks4 = useMemo(() => weeklySeries(days, today, 4).reverse(), [days, today]);
  const best4 = weeks4.reduce((b, w, i) => (w.sets > weeks4[b].sets ? i : b), 0);

  const trainedThisWeek = new Set(thisWeek.flatMap((d) => d.entries.map((e) => e.muscle)));
  const last = useMemo(() => lastTrained(days), [days]);
  const neglected = MUSCLES.map((m) => {
    const k = last.get(m.id);
    return { ...m, since: k ? differenceInCalendarDays(today, fromKey(k)) : null };
  })
    .filter((m) => m.since === null || m.since >= 7)
    .sort((a, b) => (b.since ?? 999) - (a.since ?? 999));
  const latest = days[0];
  const workouts6mo = useMemo(() => [...sets.keys()].filter((k) => differenceInCalendarDays(today, fromKey(k)) < 182).length, [sets, today]);

  const streak = useCountUp(streaks.current, 1200, 250);
  const loggedToday = sets.has(todayKey);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <ScreenHeader
        overline={`Overview · ${format(today, 'EEE, MMM d')}`}
        title={headline}
        right={<Pill label={isSunday(today) ? 'Rest day' : loggedToday ? 'Logged' : 'Not logged'} active={loggedToday} />}
      />

      <Card style={{ paddingTop: spacing.xl }}>
        <View style={{ alignItems: 'center' }}>
          <Gauge size={290} progress={thisWeek.length / TRAINING_DAYS_PER_WEEK} secondary={streaks.longest ? streaks.current / streaks.longest : 0} animKey={`${thisWeek.length}-${streaks.current}`}>
            <Text style={[type.label, { fontSize: 9 }]}>Current streak</Text>
            <Text style={styles.gaugeNum}>{Math.round(streak)}</Text>
            <Text style={styles.gaugeSub}>
              {thisWeek.length} / {TRAINING_DAYS_PER_WEEK} this week
            </Text>
            <Text style={[type.label, { marginTop: 8, fontSize: 9 }]}>Best · {streaks.longest} days</Text>
          </Gauge>
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <HatchBars
            data={week.map((w) => ({ label: format(w.d, 'EEEEE'), value: w.sets }))}
            highlight={focusIdx}
            callout={`${format(focus.d, 'EEE')} · ${focus.sets} sets`}
            footer={{ left: `Week of ${format(monday, 'MMM d')}`, right: isSunday(today) ? 'Sunday · rest' : `${thisWeek.reduce((s, d) => s + d.entries.reduce((a, e) => a + e.sets, 0), 0)} sets so far` }}
          />
        </View>
      </Card>

      <View style={styles.statRow}>
        <StatCard label={`Sets · ${format(today, 'MMMM')}`} value={monthSets} />
        <StatCard label="Longest streak" value={streaks.longest} suffix=" d" delay={100} accent />
      </View>

      <Card>
        <SectionTitle right={<Text style={type.small}>Sets per week</Text>}>Last 4 weeks</SectionTitle>
        <WeekList
          rows={weeks4.map((w, i) => ({ key: w.weekKey, label: i === 0 ? 'This wk' : w.label, value: w.sets }))}
          best={best4}
        />
      </Card>

      <Card>
        <SectionTitle right={<Text style={type.small}>{workouts6mo} workouts · 6 mo</Text>}>Activity</SectionTitle>
        <Heatmap sets={sets} today={today} onPressDay={(k) => router.push({ pathname: '/day/[date]', params: { date: k } })} />
      </Card>

      <Card>
        <SectionTitle right={<Text style={type.small}>{trainedThisWeek.size} / {MUSCLES.length} hit</Text>}>Muscles this week</SectionTitle>
        <View style={styles.muscleGrid}>
          {MUSCLES.map((m) => {
            const on = trainedThisWeek.has(m.id);
            return (
              <Pressable key={m.id} style={styles.muscleCell} onPress={() => router.push({ pathname: '/muscle/[id]', params: { id: m.id } })}>
                <View style={[styles.muscleIconBox, on && styles.muscleIconOn]}>
                  <MuscleIcon muscle={m.id} size={30} active={on} />
                </View>
                <Text style={[styles.muscleLabel, on && { color: colors.text }]} numberOfLines={1}>
                  {m.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {neglected.length > 0 && (
          <View style={styles.hint}>
            <View style={styles.hintDot} />
            <Text style={[type.small, { flex: 1, lineHeight: 18 }]}>
              <Text style={{ color: colors.text, fontFamily: fonts.bodySemi }}>Needs work · </Text>
              {neglected
                .slice(0, 4)
                .map((m) => `${m.name} ${m.since === null ? '(never)' : `${m.since}d`}`)
                .join('  ·  ')}
            </Text>
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle right={latest ? <Text style={type.small}>{format(fromKey(latest.date), 'EEE, d MMM')}</Text> : undefined}>Last workout</SectionTitle>
        {latest ? (
          <Pressable onPress={() => router.push({ pathname: '/day/[date]', params: { date: latest.date } })}>
            {latest.entries.map((e, i) => (
              <EntryRow key={i} entry={e} last={i === latest.entries.length - 1} />
            ))}
          </Pressable>
        ) : (
          <Empty title="No workouts yet" hint="Log your first session to light up the grid." />
        )}
      </Card>

      {isSunday(today) ? (
        <NeonButton title="Rest day · log Saturday" variant="outline" onPress={() => router.push('/log')} />
      ) : (
        <NeonButton title={loggedToday ? "Edit today's workout" : "Log today's workout"} pulse={!loggedToday} onPress={() => router.push('/log')} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  gaugeNum: { fontFamily: fonts.display, fontSize: 72, color: colors.text, letterSpacing: -3, lineHeight: 80, fontVariant: ['tabular-nums'] },
  gaugeSub: { fontFamily: fonts.display, fontSize: 15, color: colors.neon },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  muscleCell: { width: '25%', alignItems: 'center', gap: 6 },
  muscleIconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleIconOn: { borderColor: 'rgba(184,255,59,0.5)', backgroundColor: 'rgba(184,255,59,0.07)' },
  muscleLabel: { color: colors.muted, fontSize: 11, fontFamily: fonts.bodyMed },
  hint: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: spacing.lg, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceHi },
  hintDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.neon, marginTop: 6 },
});
