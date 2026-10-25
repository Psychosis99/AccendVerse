import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { fromKey } from '../../lib/calendar';
import { entryReps } from '../../lib/stats';
import { MuscleIcon } from '../../components/MuscleIcon';
import { Empty } from '../../components/ui';
import { colors, spacing } from '../../theme';
import type { MuscleId } from '../../data/types';

export default function History() {
  const { days } = useData();

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
      data={days}
      keyExtractor={(d) => d.date}
      ListEmptyComponent={<Empty title="Nothing logged yet" hint="Your workouts will appear here." />}
      renderItem={({ item }) => {
        const d = fromKey(item.date);
        const sets = item.entries.reduce((s, e) => s + e.sets, 0);
        const reps = item.entries.reduce((s, e) => s + entryReps(e), 0);
        const muscles = [...new Set(item.entries.map((e) => e.muscle))] as MuscleId[];
        return (
          <Pressable style={styles.row} onPress={() => router.push({ pathname: '/day/[date]', params: { date: item.date } })}>
            <View style={styles.dateBox}>
              <Text style={styles.dow}>{format(d, 'EEE')}</Text>
              <Text style={styles.day}>{format(d, 'd')}</Text>
              <Text style={styles.mon}>{format(d, 'MMM')}</Text>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <View style={styles.icons}>
                {muscles.map((m) => (
                  <View key={m} style={styles.iconBox}>
                    <MuscleIcon muscle={m} size={22} />
                  </View>
                ))}
              </View>
              <Text style={styles.summary}>
                <Text style={styles.num}>{sets}</Text> sets · <Text style={styles.num}>{reps}</Text> reps · {muscles.length} muscle
                {muscles.length === 1 ? '' : 's'}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  dateBox: { width: 50, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border, paddingRight: spacing.md },
  dow: { color: colors.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  day: { color: colors.neon, fontSize: 22, fontWeight: '900' },
  mon: { color: colors.muted, fontSize: 10, textTransform: 'uppercase' },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconBox: { width: 28, height: 28, borderRadius: 7, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  summary: { color: colors.muted, fontSize: 12 },
  num: { color: colors.text, fontWeight: '800' },
  chev: { color: colors.neon, fontSize: 26, fontWeight: '300' },
});
