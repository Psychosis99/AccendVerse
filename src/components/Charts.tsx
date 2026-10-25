import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';
import { staggered, useProgress } from '../anim/hooks';
import { formatNumber } from '../lib/stats';

function useWidth(): [number, (e: LayoutChangeEvent) => void] {
  const [w, setW] = useState(0);
  return [w, (e) => setW(Math.round(e.nativeEvent.layout.width))];
}

function Measured({ height, children }: { height: number; children: (width: number) => ReactNode }) {
  const [w, onLayout] = useWidth();
  return (
    <View style={{ height }} onLayout={onLayout}>
      {w > 0 && children(w)}
    </View>
  );
}

const PAD_L = 30;
const PAD_B = 18;
const PAD_T = 10;

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(v));
  const n = v / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

interface Point {
  label: string;
  value: number;
}

/** Vertical bars that grow in with an anime.js-driven stagger. */
export function BarChart({ data, height = 170, highlightLast = true }: { data: Point[]; height?: number; highlightLast?: boolean }) {
  const p = useProgress(data, 1000, 100, 'outExpo');
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const labelEvery = Math.ceil(data.length / 6);
  return (
    <Measured height={height}>
      {(width) => {
        const plotW = width - PAD_L;
        const plotH = height - PAD_B - PAD_T;
        const slot = plotW / data.length;
        const barW = Math.max(3, slot * 0.62);
        return (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.neon} />
                <Stop offset="1" stopColor={colors.heat[1]} />
              </LinearGradient>
            </Defs>
            {[0, 0.5, 1].map((t) => (
              <G key={t}>
                <Line x1={PAD_L} x2={width} y1={PAD_T + plotH * (1 - t)} y2={PAD_T + plotH * (1 - t)} stroke={colors.border} strokeDasharray="3 4" />
                <SvgText fontFamily="sans-serif" x={PAD_L - 6} y={PAD_T + plotH * (1 - t) + 3} fill={colors.muted} fontSize={9} textAnchor="end">
                  {formatNumber(max * t)}
                </SvgText>
              </G>
            ))}
            {data.map((d, i) => {
              const h = (d.value / max) * plotH * staggered(p, i, data.length, 0.5);
              const x = PAD_L + i * slot + (slot - barW) / 2;
              const last = highlightLast && i === data.length - 1;
              return (
                <G key={i}>
                  <Rect x={x} y={PAD_T + plotH - h} width={barW} height={h} rx={Math.min(3, barW / 2)} fill={last ? colors.neon : 'url(#bar)'} opacity={last ? 1 : 0.85} />
                  {(data.length - 1 - i) % labelEvery === 0 && (
                    <SvgText fontFamily="sans-serif" x={x + barW / 2} y={height - 4} fill={colors.muted} fontSize={9} textAnchor="middle">
                      {d.label}
                    </SvgText>
                  )}
                </G>
              );
            })}
          </Svg>
        );
      }}
    </Measured>
  );
}

/** Line + area chart; the line draws itself left to right. */
export function LineChart({ data, height = 170, unit = '' }: { data: Point[]; height?: number; unit?: string }) {
  const p = useProgress(data, 1300, 100, 'inOutQuad');
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const labelEvery = Math.ceil(data.length / 6);
  return (
    <Measured height={height}>
      {(width) => {
        const plotW = width - PAD_L - 6;
        const plotH = height - PAD_B - PAD_T;
        const step = data.length > 1 ? plotW / (data.length - 1) : 0;
        const pts = data.map((d, i) => [PAD_L + i * step, PAD_T + plotH - (d.value / max) * plotH] as const);
        const visible = Math.max(1, Math.round(p * (pts.length - 1)) + 1);
        const shown = pts.slice(0, visible);
        const line = shown.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
        const area = shown.length > 1 ? `${line} L${shown[shown.length - 1][0]},${PAD_T + plotH} L${PAD_L},${PAD_T + plotH} Z` : '';
        const last = shown[shown.length - 1];
        return (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.neon} stopOpacity={0.35} />
                <Stop offset="1" stopColor={colors.neon} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {[0, 0.5, 1].map((t) => (
              <G key={t}>
                <Line x1={PAD_L} x2={width} y1={PAD_T + plotH * (1 - t)} y2={PAD_T + plotH * (1 - t)} stroke={colors.border} strokeDasharray="3 4" />
                <SvgText fontFamily="sans-serif" x={PAD_L - 6} y={PAD_T + plotH * (1 - t) + 3} fill={colors.muted} fontSize={9} textAnchor="end">
                  {formatNumber(max * t)}
                  {t === 1 ? unit : ''}
                </SvgText>
              </G>
            ))}
            {area ? <Path d={area} fill="url(#area)" /> : null}
            <Path d={line} stroke={colors.neon} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {last && <Circle cx={last[0]} cy={last[1]} r={7} fill={colors.neonGlow} />}
            {last && <Circle cx={last[0]} cy={last[1]} r={3.5} fill={colors.neon} />}
            {data.map((d, i) =>
              (data.length - 1 - i) % labelEvery === 0 ? (
                <SvgText fontFamily="sans-serif" key={i} x={PAD_L + i * step} y={height - 4} fill={colors.muted} fontSize={9} textAnchor={i === data.length - 1 ? 'end' : 'middle'}>
                  {d.label}
                </SvgText>
              ) : null,
            )}
          </Svg>
        );
      }}
    </Measured>
  );
}

// Shades of neon green for donut slices (largest first).
const DONUT = ['#39FF14', '#2FD615', '#26AD12', '#1F8C10', '#B4FF9F', '#7DFF5C', '#18700D', '#5CE63A', '#125409', '#9BE88A', '#0E3F08'];

/** Donut that sweeps open; legend beside it. */
export function Donut({ data, size = 150, center }: { data: Point[]; size?: number; center?: { value: string; label: string } }) {
  const p = useProgress(data, 1200, 100, 'outCubic');
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const sorted = [...data].filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  return (
    <View style={styles.donutRow}>
      <View>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceHi} strokeWidth={16} fill="none" />
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            {sorted.map((d, i) => {
              const len = total ? (d.value / total) * c * p : 0;
              const el = (
                <Circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={DONUT[i % DONUT.length]}
                  strokeWidth={16}
                  fill="none"
                  strokeDasharray={`${Math.max(0, len - 1.5)} ${c}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return el;
            })}
          </G>
        </Svg>
        {center && (
          <View style={[StyleSheet.absoluteFill, styles.donutCenter]}>
            <Text style={styles.donutValue}>{center.value}</Text>
            <Text style={styles.donutLabel}>{center.label}</Text>
          </View>
        )}
      </View>
      <View style={styles.legend}>
        {sorted.slice(0, 7).map((d, i) => (
          <View key={d.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: DONUT[i % DONUT.length] }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {d.label}
            </Text>
            <Text style={styles.legendValue}>{total ? Math.round((d.value / total) * 100) : 0}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutCenter: { alignItems: 'center', justifyContent: 'center' },
  donutValue: { color: colors.neon, fontSize: 22, fontWeight: '800' },
  donutLabel: { color: colors.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 3 },
  legendLabel: { color: colors.text, flex: 1, fontSize: 12 },
  legendValue: { color: colors.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
});
