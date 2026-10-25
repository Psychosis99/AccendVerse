import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useData } from '../../data/DataContext';
import { fromKey } from '../../lib/calendar';
import { entryReps } from '../../lib/stats';
import { MuscleIcon } from '../../components/MuscleIcon';
import { Empty, ScreenHeader } from '../../components/ui';
import { colors, fonts, radius, spacing } from '../../theme';
import type { MuscleId } from '../../data/types';

export default function History() {
  const { days } = useData();

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}
      ListHeaderComponent={<ScreenHeader overline={`History · ${days.length} sessions`} title="Every rep, logged." />}
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
                    <MuscleIcon muscle={m} size={24} />
                  </View>
                ))}
              </View>
              <Text style={styles.summary}>
                <Text style={styles.num}>{sets}</Text> sets  ·  <Text style={styles.num}>{reps}</Text> reps
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
    paddingLeft: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.borderHi,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  dateBox: { width: 46, alignItems: 'flex-start' },
  dow: { color: colors.muted, fontSize: 10, fontFamily: fonts.displayMed, letterSpacing: 1.5, textTransform: 'uppercase' },
  day: { color: colors.text, fontSize: 26, fontFamily: fonts.display, letterSpacing: -1, lineHeight: 30 },
  mon: { color: colors.neon, fontSize: 10, fontFamily: fonts.displayMed, letterSpacing: 1.5, textTransform: 'uppercase' },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconBox: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.surfaceHi, alignItems: 'center', justifyContent: 'center' },
  summary: { color: colors.muted, fontSize: 12, fontFamily: fonts.body },
  num: { color: colors.text, fontFamily: fonts.display },
  chev: { color: colors.muted, fontSize: 24, fontFamily: fonts.body },
});
