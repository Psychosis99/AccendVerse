import { Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { TabIcon } from '../../components/TabIcon';
import { colors } from '../../theme';

function SettingsButton() {
  return (
    <Pressable onPress={() => router.push('/settings')} hitSlop={12} style={{ marginRight: 16 }}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={3.2} stroke={colors.neon} strokeWidth={2} fill="none" />
        <Path
          d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"
          stroke={colors.neon}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </Pressable>
  );
}

function Brand() {
  return (
    <Text style={{ color: colors.neon, fontWeight: '900', letterSpacing: 4, fontSize: 18, textShadowColor: colors.neonGlow, textShadowRadius: 10 }}>
      ACCENDVERSE
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        headerRight: () => <SettingsButton />,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border, height: 64, paddingTop: 6 },
        tabBarActiveTintColor: colors.neon,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', headerTitle: () => <Brand />, tabBarIcon: ({ color }) => <TabIcon name="dashboard" color={color} /> }}
      />
      <Tabs.Screen name="log" options={{ title: 'Log', headerTitle: 'Log Workout', tabBarIcon: ({ color }) => <TabIcon name="log" color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <TabIcon name="history" color={color} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ color }) => <TabIcon name="stats" color={color} /> }} />
    </Tabs>
  );
}
