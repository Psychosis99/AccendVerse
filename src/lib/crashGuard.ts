import { Alert, Platform } from 'react-native';

type Handler = (error: Error, isFatal?: boolean) => void;
interface ErrorUtilsLike {
  getGlobalHandler(): Handler;
  setGlobalHandler(h: Handler): void;
}

/**
 * Errors thrown outside rendering (tap handlers, timers, promises) skip React error
 * boundaries and, in release builds, close the app ("keeps stopping"). Show them in an
 * alert instead so the app stays usable and the message can be reported.
 */
export function installCrashGuard() {
  if (Platform.OS === 'web') return;
  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (!errorUtils) return;
  const fallback = errorUtils.getGlobalHandler();
  let showing = false;
  errorUtils.setGlobalHandler((error, isFatal) => {
    if (__DEV__) return fallback(error, isFatal);
    if (showing) return;
    showing = true;
    Alert.alert('Something went wrong', `${error?.message ?? String(error)}\n\nYour data is safe. Please screenshot this and report it.`, [
      { text: 'OK', onPress: () => (showing = false) },
    ]);
  });
}
