import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

/** The "AV" wordmark used in the app header. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.mark, { fontSize: size, lineHeight: size * 1.15 }]}>
        A<Text style={{ color: colors.neon }}>V</Text>
      </Text>
      <View style={[styles.dot, { width: size * 0.22, height: size * 0.22, borderRadius: size }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  mark: {
    fontFamily: fonts.logo,
    color: colors.text,
    letterSpacing: -0.5,
    textShadowColor: colors.neonGlow,
    textShadowRadius: 12,
  },
  dot: { backgroundColor: colors.neon, marginBottom: 5, shadowColor: colors.neon, shadowOpacity: 0.9, shadowRadius: 6 },
});
