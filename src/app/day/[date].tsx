import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { fromKey } from '../../lib/calendar';
import { entryReps, entryVolume } from '../../lib/stats';
import { EntryRow } from '../../components/EntryRow';
import { Card, Empty, NeonButton, Pill, ScreenHeader, SectionTitle, StatCard } from '../../components/ui';
import { colors, spacing, type } from '../../theme';

export default function DayDetail() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { getDay, deleteDay } = useData();
  const day = getDay(date);
  const d = fromKey(date);

  const sets = day?.entries.reduce((s, e) => s + e.sets, 0) ?? 0;
  const reps = day?.entries.reduce((s, e) => s + entryReps(e), 0) ?? 0;
  const volume = day?.entries.reduce((s, e) => s + entryVolume(e), 0) ?? 0;

  const confirmDelete = () => {
    const run = async () => {
      await deleteDay(date);
      router.back();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this workout?')) run();
      return;
    }
    Alert.alert('Delete workout?', format(d, 'EEEE, d MMMM'), [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <ScreenHeader
        overline={`Workout · ${format(d, 'MMM d, yyyy')}`}
        title={format(d, 'EEEE')}
        right={<Pill label={day ? `${day.entries.length} entries` : 'Rest'} active={!!day} />}
      />

      {day ? (
        <>
          <View style={styles.statGrid}>
            <StatCard label="Sets" value={sets} style={styles.statSmall} accent />
            <StatCard label="Reps" value={reps} delay={80} style={styles.statSmall} />
            <StatCard label="Kg moved" value={volume} delay={160} style={styles.statSmall} />
          </View>
          <Card>
            <SectionTitle>Entries</SectionTitle>
            {day.entries.map((e, i) => (
              <EntryRow key={i} entry={e} last={i === day.entries.length - 1} />
            ))}
            {day.notes ? <Text style={[type.body, { marginTop: spacing.md, fontStyle: 'italic' }]}>“{day.notes}”</Text> : null}
          </Card>
          <View style={{ gap: spacing.md }}>
            <NeonButton title="Edit workout" onPress={() => router.navigate({ pathname: '/log', params: { date } })} />
            <NeonButton title="Delete" variant="danger" onPress={confirmDelete} />
          </View>
        </>
      ) : (
        <Card>
          <Empty title="Rest day" hint="Nothing logged for this day." />
          <NeonButton title="Log this day" variant="outline" onPress={() => router.navigate({ pathname: '/log', params: { date } })} />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  statGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statSmall: { minWidth: 0 },
});
