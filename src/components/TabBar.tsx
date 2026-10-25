import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';
import { TabIcon, type TabIconName } from './TabIcon';

const ICONS: Record<string, TabIconName> = { index: 'dashboard', log: 'log', history: 'history', stats: 'stats' };
const LABELS: Record<string, string> = { index: 'Home', log: 'Log', history: 'History', stats: 'Stats' };

interface Props {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void; emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean } };
}

/** Floating pill tab bar; the active tab expands into a lime capsule with its label. */
export function TabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={[styles.item, focused && styles.itemOn]}>
              <TabIcon name={ICONS[route.name] ?? 'dashboard'} color={focused ? colors.onNeon : colors.muted} size={20} />
              {focused && <Text style={styles.label}>{LABELS[route.name] ?? route.name}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 8 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopColor: colors.borderHi,
    borderRadius: radius.pill,
    padding: 6,
  },
  item: { height: 44, minWidth: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  itemOn: { backgroundColor: colors.neon, shadowColor: colors.neon, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6 },
  label: { fontFamily: fonts.display, fontSize: 13, color: colors.onNeon, letterSpacing: 0.3 },
});
