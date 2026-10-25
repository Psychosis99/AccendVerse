import { Pressable } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Logo } from '../../components/Logo';
import { TabBar } from '../../components/TabBar';
import { colors, radius } from '../../theme';

function SettingsButton() {
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      hitSlop={10}
      style={{
        marginRight: 20,
        width: 38,
        height: 38,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={3} stroke={colors.text} strokeWidth={1.8} fill="none" />
        <Path
          d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"
          stroke={colors.text}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tabBar={(props) => <TabBar {...(props as any)} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg, height: 96 },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitle: () => <Logo />,
        headerTitleContainerStyle: { paddingLeft: 4 },
        headerRight: () => <SettingsButton />,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="log" options={{ title: 'Log' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
    </Tabs>
  );
}
