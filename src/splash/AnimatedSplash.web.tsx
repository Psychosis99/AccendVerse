import { createElement, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SPLASH_HTML } from './splashHtml';

/** Web preview of the anime.js intro: same HTML as the Android WebView, in an iframe. */
export function AnimatedSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => e.data === 'done' && onDone();
    window.addEventListener('message', onMessage);
    const t = setTimeout(onDone, 5000);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(t);
    };
  }, [onDone]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      {createElement('iframe', {
        srcDoc: SPLASH_HTML,
        style: { border: 0, width: '100%', height: '100%', background: '#000' },
        title: 'AccendVerse',
      })}
    </View>
  );
}
