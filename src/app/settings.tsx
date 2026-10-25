import { Alert, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { useData } from '../data/DataContext';
import { isMuscleId } from '../data/muscles';
import type { Backup, DayLog } from '../data/types';
import { Card, NeonButton, SectionTitle } from '../components/ui';
import { colors, spacing } from '../theme';

function notify(title: string, msg?: string) {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n${msg}` : title);
  else Alert.alert(title, msg);
}

function confirm(title: string, msg: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${msg}`)) onYes();
    return;
  }
  Alert.alert(title, msg, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Continue', style: 'destructive', onPress: onYes },
  ]);
}

function parseBackup(text: string): DayLog[] {
  const data = JSON.parse(text) as Partial<Backup>;
  if (data.app !== 'AccendVerse' || !Array.isArray(data.days)) throw new Error('Not an AccendVerse backup file.');
  return data.days
    .filter((d) => typeof d?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Array.isArray(d.entries))
    .map((d) => ({
      date: d.date,
      notes: typeof d.notes === 'string' ? d.notes : null,
      entries: d.entries
        .filter((e) => isMuscleId(e?.muscle))
        .map((e) => ({
          muscle: e.muscle,
          exercise: typeof e.exercise === 'string' ? e.exercise : null,
          sets: Math.max(0, Math.round(Number(e.sets) || 0)),
          reps: Math.max(0, Math.round(Number(e.reps) || 0)),
          weightKg: e.weightKg == null ? null : Number(e.weightKg) || null,
        })),
    }));
}

export default function Settings() {
  const { days, replaceAll } = useData();

  async function exportBackup() {
    try {
      const backup: Backup = { app: 'AccendVerse', version: 1, exportedAt: new Date().toISOString(), days };
      const file = new File(Paths.cache, `accendverse-backup-${format(new Date(), 'yyyy-MM-dd')}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(JSON.stringify(backup, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Save AccendVerse backup' });
      } else {
        notify('Backup written', file.uri);
      }
    } catch (e) {
      notify('Export failed', String(e));
    }
  }

  async function importBackup() {
    try {
      const picked = await File.pickFileAsync({ mimeTypes: ['application/json', '*/*'] });
      if (picked.canceled) return;
      const imported = parseBackup(await picked.result.text());
      confirm('Replace all data?', `This will replace your ${days.length} logged days with ${imported.length} days from the backup.`, async () => {
        await replaceAll(imported);
        notify('Backup restored', `${imported.length} days imported.`);
      });
    } catch (e) {
      notify('Import failed', e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Card>
        <SectionTitle>Your data</SectionTitle>
        <Text style={styles.text}>
          Everything is stored only on this phone, in a local database. Nothing is uploaded. You have{' '}
          <Text style={{ color: colors.neon, fontWeight: '800' }}>{days.length}</Text> workouts logged.
        </Text>
      </Card>
      <Card style={{ gap: spacing.md }}>
        <SectionTitle>Backup</SectionTitle>
        <Text style={styles.text}>Export a JSON file you can keep in your files or Drive, and import it on a new phone.</Text>
        <NeonButton title="Export backup" onPress={exportBackup} />
        <NeonButton title="Import backup" variant="outline" onPress={importBackup} />
      </Card>
      <Card style={{ gap: spacing.md }}>
        <SectionTitle>Danger zone</SectionTitle>
        <NeonButton
          title="Erase all data"
          variant="danger"
          onPress={() => confirm('Erase everything?', 'All logged workouts will be permanently deleted.', () => replaceAll([]))}
        />
      </Card>
      <Text style={styles.footer}>AccendVerse v1.0 · Mon–Sat training, Sundays off</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 40 },
  text: { color: colors.muted, lineHeight: 20 },
  footer: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: spacing.lg },
});
