import { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded/800ExtraBold';
import { DataProvider, useData } from '../data/DataContext';
import { AnimatedSplash } from '../splash/AnimatedSplash';
import { colors, fonts } from '../theme';

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
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Unbounded_800ExtraBold,
  });
  const fontsReady = fontsLoaded || !!fontError;
  const [introDone, setIntroDone] = useState(skipSplash);
  const onIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
    // Hand over from the static native splash to the anime.js intro immediately.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {fontsReady && (
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
            headerTintColor: colors.neon,
            headerTitle: '',
            headerBackButtonDisplayMode: 'minimal',
            headerTitleStyle: { color: colors.text, fontFamily: fonts.display },
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="muscle/[id]" />
          <Stack.Screen name="day/[date]" />
          <Stack.Screen name="settings" />
        </Stack>
      )}
      {!(introDone && ready && fontsReady) && <AnimatedSplash onDone={onIntroDone} />}
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
