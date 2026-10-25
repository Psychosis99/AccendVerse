import type { TextStyle } from 'react-native';

export const colors = {
  bg: '#0A0B0B',
  surface: '#141616',
  surfaceHi: '#1C1F1F',
  surfaceLo: '#101212',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.12)',
  neon: '#B8FF3B',
  neonDim: '#8FCB2A',
  neonGlow: 'rgba(184, 255, 59, 0.28)',
  onNeon: '#0A0B0B',
  text: '#ECEEEA',
  sub: '#A9AEAA',
  muted: '#6E7470',
  faint: '#3A3F3C',
  danger: '#FF5A6E',
  // Heatmap intensity levels 0..4: graphite → lime
  heat: ['#1C1F1F', '#33421C', '#55791F', '#86BF2A', '#B8FF3B'],
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

/** Font family names registered with expo-font in the root layout. */
export const fonts = {
  logo: 'Unbounded_800ExtraBold',
  display: 'SpaceGrotesk_700Bold',
  displayMed: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
};

export const type = {
  overline: { fontFamily: fonts.displayMed, fontSize: 11, letterSpacing: 2.2, color: colors.muted, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.8, color: colors.text, lineHeight: 34 },
  headline: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.6, color: colors.text, lineHeight: 30 },
  h3: { fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.2, color: colors.text },
  label: { fontFamily: fonts.displayMed, fontSize: 10, letterSpacing: 1.8, color: colors.muted, textTransform: 'uppercase' },
  body: { fontFamily: fonts.body, fontSize: 14, color: colors.sub, lineHeight: 20 },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  num: { fontFamily: fonts.display, color: colors.text, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;
