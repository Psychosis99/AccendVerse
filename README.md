# AccendVerse

An offline gym progress tracker for Android, themed in neon green on black.

- **LeetCode-style activity grid**: Monday to Saturday only. Sundays are rest days, so they never appear and never break a streak. Cell brightness shows total sets that day.
- **Per-muscle tracking**: log sets × reps (plus optional exercise and weight) for 11 muscle groups. Each entry has its own muscle icon.
- **Dashboard and stats**: current and longest streaks, weekly sets, muscle split donut, per-muscle volume trends, and neglected-muscle hints.
- **Fully local**: everything is stored in an on-device SQLite database. You can export or import a JSON backup from Settings.
- **anime.js animations**: an intro played while the app loads, count-up numbers, staggered heatmap and chart reveals, and a pulsing Save button.

## Stack

Expo (React Native, TypeScript), Expo Router, expo-sqlite, react-native-svg, react-native-webview, anime.js v4, date-fns.

## Develop

```bash
npm install          # also generates src/splash/splashHtml.ts (anime.js intro)
npm test             # calendar/streak/stats unit tests
npm run typecheck
npx expo start       # dev server
npx expo start --web # browser preview (uses in-memory demo data)
```

## Build the APK

Every push to `main` runs the **Android APK** GitHub Actions workflow. You can also start it manually under *Actions → Android APK → Run workflow*. Download `AccendVerse-apk` from the run's artifacts and install it on your phone. You may need to allow installs from unknown sources.

To build locally (needs the Android SDK and JDK 17):

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK at android/app/build/outputs/apk/release/app-release.apk
```

## Previews

See [`previews/`](previews) for screenshots of every screen.
