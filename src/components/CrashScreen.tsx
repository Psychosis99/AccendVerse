import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ErrorBoundaryProps } from 'expo-router';
import { colors, fonts, radius, spacing, type } from '../theme';
import { NeonButton } from './ui';

/** Route-level error boundary: shows what broke instead of closing the app. */
export function CrashScreen({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.wrap}>
      <Text style={type.overline}>Error · AccendVerse</Text>
      <Text style={[type.title, { marginTop: 6 }]}>Something went wrong.</Text>
      <Text style={[type.body, { marginTop: spacing.sm }]}>Your workouts are safe. Screenshot this and send it over, then try again.</Text>
      <ScrollView style={styles.box} contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.msg}>{error.message}</Text>
        {error.stack ? <Text style={styles.stack}>{error.stack.split('\n').slice(0, 12).join('\n')}</Text> : null}
      </ScrollView>
      <NeonButton title="Try again" onPress={() => void retry()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 72, gap: spacing.md },
  box: { flexGrow: 0, maxHeight: 360, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginVertical: spacing.md },
  msg: { fontFamily: fonts.bodySemi, color: colors.danger, fontSize: 14 },
  stack: { fontFamily: 'monospace', color: colors.muted, fontSize: 10, marginTop: spacing.md },
});
