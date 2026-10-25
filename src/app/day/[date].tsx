import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { fromKey } from '../../lib/calendar';
import { entryReps, entryVolume, formatNumber } from '../../lib/stats';
import { EntryRow } from '../../components/EntryRow';
import { Card, Empty, NeonButton, SectionTitle, StatCard } from '../../components/ui';
import { colors, spacing } from '../../theme';

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
    <>
      <Stack.Screen options={{ title: format(d, 'EEE, d MMM yyyy') }} />
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{format(d, 'EEEE')}</Text>
        <Text style={styles.subtitle}>{format(d, 'd MMMM yyyy')}</Text>

        {day ? (
          <>
            <View style={styles.statGrid}>
              <StatCard label="Sets" value={sets} style={styles.statSmall} />
              <StatCard label="Reps" value={reps} delay={80} style={styles.statSmall} />
              <StatCard label="Volume" value={volume} suffix=" kg" delay={160} style={styles.statSmall} />
            </View>
            <Card>
              <SectionTitle right={<Text style={styles.meta}>{formatNumber(day.entries.length)} entries</Text>}>Entries</SectionTitle>
              {day.entries.map((e, i) => (
                <EntryRow key={i} entry={e} />
              ))}
              {day.notes ? <Text style={styles.notes}>“{day.notes}”</Text> : null}
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
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40 },
  title: { color: colors.neon, fontSize: 30, fontWeight: '900' },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
  statGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statSmall: { minWidth: 0 },
  meta: { color: colors.muted, fontSize: 11 },
  notes: { color: colors.muted, fontStyle: 'italic', marginTop: spacing.md },
});
