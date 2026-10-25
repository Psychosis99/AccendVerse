import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { colors } from '../theme';
import { useProgress } from '../anim/hooks';

const TICKS = 72;

/**
 * Dial with a tick ring, a thick lime progress band (with a handle at its tip), and a thin
 * inner arc for a secondary value. Both arcs sweep in with anime.js.
 */
export function Gauge({
  size = 260,
  progress,
  secondary = 0,
  animKey,
  children,
}: {
  size?: number;
  /** 0..1, thick outer band */
  progress: number;
  /** 0..1, thin inner arc */
  secondary?: number;
  animKey?: unknown;
  children?: ReactNode;
}) {
  const p = useProgress(animKey ?? progress, 1400, 200, 'outExpo');
  const c = size / 2;
  const band = size * 0.055;
  const R = c - size * 0.11;
  const r2 = R - band / 2 - size * 0.03;
  const circ = 2 * Math.PI * R;
  const circ2 = 2 * Math.PI * r2;
  const frac = Math.max(0, Math.min(0.995, progress)) * p;
  const angle = frac * 2 * Math.PI - Math.PI / 2;
  const knob = { x: c + R * Math.cos(angle), y: c + R * Math.sin(angle) };
  const tickIn = R + band / 2 + size * 0.03;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Tick ring */}
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * 2 * Math.PI - Math.PI / 2;
          const major = i % 6 === 0;
          const len = major ? size * 0.035 : size * 0.018;
          const lit = i / TICKS <= frac;
          return (
            <Line
              key={i}
              x1={c + tickIn * Math.cos(a)}
              y1={c + tickIn * Math.sin(a)}
              x2={c + (tickIn + len) * Math.cos(a)}
              y2={c + (tickIn + len) * Math.sin(a)}
              stroke={lit && major ? colors.neon : major ? colors.muted : colors.faint}
              strokeWidth={major ? 1.6 : 1}
              strokeLinecap="round"
            />
          );
        })}
        {/* Inner face */}
        <Circle cx={c} cy={c} r={R - band / 2} fill={colors.surfaceLo} stroke={colors.border} />
        {/* Track + band */}
        <Circle cx={c} cy={c} r={R} stroke={colors.surfaceHi} strokeWidth={band} fill="none" />
        <G rotation={-90} origin={`${c}, ${c}`}>
          <Circle
            cx={c}
            cy={c}
            r={R}
            stroke={colors.neon}
            strokeWidth={band}
            fill="none"
            strokeDasharray={`${circ * frac} ${circ}`}
          />
          <Circle cx={c} cy={c} r={r2} stroke={colors.faint} strokeWidth={2} fill="none" strokeDasharray="2 5" />
          <Circle
            cx={c}
            cy={c}
            r={r2}
            stroke={colors.neon}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
            strokeDasharray={`${circ2 * Math.max(0.001, Math.min(1, secondary)) * p} ${circ2}`}
          />
        </G>
        {/* Handle at the tip of the band */}
        {frac > 0.001 && (
          <G>
            <Circle cx={knob.x} cy={knob.y} r={band * 0.95} fill={colors.neonGlow} />
            <Circle cx={knob.x} cy={knob.y} r={band * 0.62} fill={colors.bg} stroke={colors.neon} strokeWidth={2} />
            <Circle cx={knob.x} cy={knob.y} r={band * 0.22} fill={colors.neon} />
          </G>
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
