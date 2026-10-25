import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { addDays, format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { MUSCLES, muscleName } from '../../data/muscles';
import type { Entry, MuscleId } from '../../data/types';
import { fromKey, isSunday, toKey, trainingDayOnOrBefore } from '../../lib/calendar';
import { useToday } from '../../lib/useToday';
import { MuscleIcon } from '../../components/MuscleIcon';
import { Stepper } from '../../components/Stepper';
import { Card, Chip, NeonButton, Pill, ScreenHeader, SectionTitle } from '../../components/ui';
import { colors, fonts, radius, spacing, type } from '../../theme';

type Draft = Entry & { key: number };

let nextKey = 1;
const toDraft = (e: Entry): Draft => ({ ...e, key: nextKey++ });

function notify(title: string, msg?: string) {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n${msg}` : title);
  else Alert.alert(title, msg);
}

export default function LogScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const today = useToday();
  const { getDay, saveDay, ready } = useData();

  // Last 18 training days (Mon–Sat), newest first. Sundays are not selectable.
  const dateOptions = useMemo(() => {
    const out: string[] = [];
    for (let d = trainingDayOnOrBefore(today); out.length < 18; d = addDays(d, -1)) if (!isSunday(d)) out.push(toKey(d));
    return out;
  }, [today]);

  const [date, setDate] = useState(() => params.date ?? toKey(trainingDayOnOrBefore(today)));
  useEffect(() => {
    if (params.date && !isSunday(fromKey(params.date))) setDate(params.date);
  }, [params.date]);

  const [entries, setEntries] = useState<Draft[]>([]);
  const [notes, setNotes] = useState('');
  const [dirty, setDirty] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || loadedFor.current === date) return;
    const existing = getDay(date);
    setEntries((existing?.entries ?? []).map(toDraft));
    setNotes(existing?.notes ?? '');
    setDirty(false);
    loadedFor.current = date;
  }, [date, ready, getDay]);

  const existing = getDay(date);
  const update = (key: number, patch: Partial<Entry>) => {
    setEntries((list) => list.map((e) => (e.key === key ? { ...e, ...patch } : e)));
    setDirty(true);
  };
  const addMuscle = (muscle: MuscleId) => {
    // Pre-fill from the most recent entry for this muscle on this day, else sensible defaults.
    const prev = [...entries].reverse().find((e) => e.muscle === muscle);
    setEntries((list) => [...list, toDraft({ muscle, exercise: null, sets: prev?.sets ?? 3, reps: prev?.reps ?? 10, weightKg: prev?.weightKg ?? null })]);
    setDirty(true);
  };
  const remove = (key: number) => {
    setEntries((list) => list.filter((e) => e.key !== key));
    setDirty(true);
  };

  const totalSets = entries.reduce((s, e) => s + e.sets, 0);

  async function onSave() {
    const clean = entries.filter((e) => e.sets > 0 && e.reps > 0).map(({ key: _k, id: _id, ...e }) => ({ ...e, exercise: e.exercise?.trim() || null }));
    await saveDay({ date, notes: notes.trim() || null, entries: clean });
    setDirty(false);
    loadedFor.current = null;
    notify(clean.length ? 'Workout saved' : 'Day cleared', clean.length ? `${clean.reduce((s, e) => s + e.sets, 0)} sets logged for ${format(fromKey(date), 'EEE d MMM')}` : undefined);
    if (clean.length) router.navigate('/');
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader
        overline={`Log · ${format(fromKey(date), 'EEEE, MMM d')}`}
        title={existing ? 'Edit workout' : 'Log workout'}
        right={<Pill label={existing ? 'Editing' : 'New'} active={!!existing} />}
      />
      <SectionTitle>Day</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: spacing.lg }}>
        {dateOptions.map((k) => {
          const d = fromKey(k);
          const on = k === date;
          const logged = !!getDay(k);
          return (
            <Pressable
              key={k}
              onPress={() => {
                if (dirty && k !== date && Platform.OS !== 'web') {
                  Alert.alert('Discard changes?', 'You have unsaved entries for this day.', [
                    { text: 'Keep editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => setDate(k) },
                  ]);
                } else setDate(k);
              }}
              style={[styles.dateChip, on && styles.dateChipOn]}
            >
              <Text style={[styles.dateDow, on && { color: colors.bg }]}>{format(d, 'EEE')}</Text>
              <Text style={[styles.dateNum, on && { color: colors.bg }]}>{format(d, 'd')}</Text>
              <View style={[styles.dot, { backgroundColor: logged ? (on ? colors.bg : colors.neon) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionTitle>Add muscle group</SectionTitle>
      <View style={styles.chips}>
        {MUSCLES.map((m) => (
          <Chip
            key={m.id}
            label={m.name}
            active={entries.some((e) => e.muscle === m.id)}
            onPress={() => addMuscle(m.id)}
            icon={<MuscleIcon muscle={m.id} size={20} active={entries.some((e) => e.muscle === m.id)} />}
          />
        ))}
      </View>

      <SectionTitle
        right={
          <Text style={styles.total}>
            {totalSets} <Text style={type.small}>sets</Text>
          </Text>
        }
      >
        Entries
      </SectionTitle>
      {entries.length === 0 && <Text style={styles.empty}>Tap a muscle group above to add sets × reps.</Text>}
      {entries.map((e) => (
        <Card key={e.key} style={styles.entryCard}>
          <View style={styles.entryHead}>
            <View style={styles.iconBox}>
              <MuscleIcon muscle={e.muscle} size={32} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryMuscle}>{muscleName(e.muscle)}</Text>
              <TextInput
                style={styles.exercise}
                placeholder="Exercise (optional)"
                placeholderTextColor={colors.muted}
                value={e.exercise ?? ''}
                onChangeText={(t) => update(e.key, { exercise: t })}
              />
            </View>
            <Pressable onPress={() => remove(e.key)} hitSlop={10}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.steppers}>
            <Stepper label="Sets" value={e.sets} onChange={(v) => update(e.key, { sets: v ?? 0 })} />
            <Stepper label="Reps" value={e.reps} onChange={(v) => update(e.key, { reps: v ?? 0 })} />
            <Stepper label="Kg" value={e.weightKg} step={2.5} decimal onChange={(v) => update(e.key, { weightKg: v })} />
          </View>
        </Card>
      ))}

      <TextInput
        style={styles.notes}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.muted}
        value={notes}
        multiline
        onChangeText={(t) => {
          setNotes(t);
          setDirty(true);
        }}
      />

      <NeonButton title={existing ? 'Update workout' : 'Save workout'} pulse={dirty && entries.length > 0} disabled={!dirty} onPress={onSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  dateChip: {
    width: 54,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipOn: { backgroundColor: colors.neon, borderColor: colors.neon, shadowColor: colors.neon, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  dateDow: { color: colors.muted, fontSize: 10, fontFamily: fonts.displayMed, letterSpacing: 1, textTransform: 'uppercase' },
  dateNum: { color: colors.text, fontSize: 20, fontFamily: fonts.display, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.xl },
  total: { color: colors.neon, fontFamily: fonts.display, fontSize: 16 },
  empty: { ...type.small, marginBottom: spacing.lg },
  entryCard: { padding: spacing.lg },
  entryHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  iconBox: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(184,255,59,0.08)', borderWidth: 1, borderColor: 'rgba(184,255,59,0.4)' },
  entryMuscle: { color: colors.text, fontFamily: fonts.display, fontSize: 17 },
  exercise: { color: colors.sub, fontSize: 13, fontFamily: fonts.body, paddingVertical: 2 },
  remove: { color: colors.muted, fontSize: 15, padding: 6 },
  steppers: { flexDirection: 'row', gap: spacing.sm },
  notes: {
    color: colors.text,
    fontFamily: fonts.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 64,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
});
