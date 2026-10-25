import { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { DataProvider, useData } from '../data/DataContext';
import { AnimatedSplash } from '../splash/AnimatedSplash';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.neon,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    notification: colors.neon,
  },
};

// `?nosplash` skips the intro on web (used when capturing screen previews).
const skipSplash = Platform.OS === 'web' && typeof location !== 'undefined' && location.search.includes('nosplash');

function Root() {
  const { ready } = useData();
  const [introDone, setIntroDone] = useState(skipSplash);
  const onIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
    // Hand over from the static native splash to the anime.js intro immediately.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.neon,
          headerTitleStyle: { color: colors.text, fontWeight: '800' },
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="muscle/[id]" options={{ title: 'Muscle' }} />
        <Stack.Screen name="day/[date]" options={{ title: 'Workout' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
      {!(introDone && ready) && <AnimatedSplash onDone={onIntroDone} />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="light" />
      <DataProvider>
        <Root />
      </DataProvider>
    </ThemeProvider>
  );
}
