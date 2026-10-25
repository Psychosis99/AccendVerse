import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SPLASH_HTML } from './splashHtml';
import { colors } from '../theme';

/** Full-screen anime.js intro rendered in a WebView; calls `onDone` when the timeline ends. */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  // Safety net in case the WebView never reports back.
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        source={{ html: SPLASH_HTML }}
        originWhitelist={['*']}
        style={{ backgroundColor: colors.bg }}
        containerStyle={{ backgroundColor: colors.bg }}
        scrollEnabled={false}
        overScrollMode="never"
        onMessage={(e) => e.nativeEvent.data === 'done' && onDone()}
        onError={onDone}
      />
    </View>
  );
}
