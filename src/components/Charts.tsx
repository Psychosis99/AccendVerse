import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Pattern, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { staggered, useProgress } from '../anim/hooks';
import { formatNumber } from '../lib/stats';

function Measured({ height, children }: { height: number; children: (width: number) => ReactNode }) {
  const [w, setW] = useState(0);
  return (
    <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width))}>
      {w > 0 && children(w)}
    </View>
  );
}

const PAD_L = 32;
const PAD_B = 20;
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

// Restart animations only when the numbers change, not on every re-render.
const seriesKey = (data: Point[]) => data.map((d) => d.value).join(',');

function Grid({ width, plotH, max, unit = '' }: { width: number; plotH: number; max: number; unit?: string }) {
  return (
    <>
      {[0, 0.5, 1].map((t) => (
        <G key={t}>
          <Line x1={PAD_L} x2={width} y1={PAD_T + plotH * (1 - t)} y2={PAD_T + plotH * (1 - t)} stroke={colors.border} strokeDasharray="2 5" />
          <SvgText x={PAD_L - 8} y={PAD_T + plotH * (1 - t) + 3} fill={colors.muted} fontSize={9} fontFamily={fonts.displayMed} textAnchor="end">
            {formatNumber(max * t)}
            {t === 1 ? unit : ''}
          </SvgText>
        </G>
      ))}
    </>
  );
}

function XLabels({ data, x, height }: { data: Point[]; x: (i: number) => number; height: number }) {
  const every = Math.ceil(data.length / 6);
  return (
    <>
      {data.map((d, i) =>
        (data.length - 1 - i) % every === 0 ? (
          <SvgText
            key={i}
            x={x(i)}
            y={height - 4}
            fill={i === data.length - 1 ? colors.sub : colors.muted}
            fontSize={9}
            fontFamily={fonts.displayMed}
            textAnchor={i === data.length - 1 ? 'end' : 'middle'}
          >
            {d.label}
          </SvgText>
        ) : null,
      )}
    </>
  );
}

/** Striped bars; the latest bar is solid lime. Bars grow in with an anime.js stagger. */
export function BarChart({ data, height = 170 }: { data: Point[]; height?: number }) {
  const p = useProgress(seriesKey(data), 1000, 100, 'outExpo');
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  return (
    <Measured height={height}>
      {(width) => {
        const plotW = width - PAD_L;
        const plotH = height - PAD_B - PAD_T;
        const slot = plotW / data.length;
        const barW = Math.max(4, Math.min(22, slot * 0.55));
        const bx = (i: number) => PAD_L + i * slot + (slot - barW) / 2;
        return (
          <Svg width={width} height={height}>
            <Defs>
              <Pattern id="avHatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                <Rect width={6} height={6} fill={colors.surfaceHi} />
                <Line x1={0} y1={0} x2={0} y2={6} stroke={colors.muted} strokeWidth={2.2} opacity={0.55} />
              </Pattern>
            </Defs>
            <Grid width={width} plotH={plotH} max={max} />
            {data.map((d, i) => {
              const h = (d.value / max) * plotH * staggered(p, i, data.length, 0.5);
              const last = i === data.length - 1;
              return (
                <G key={i}>
                  {last && h > 0 && <Rect x={bx(i) - 3} y={PAD_T + plotH - h - 3} width={barW + 6} height={h + 3} rx={7} fill={colors.neonGlow} />}
                  <Rect x={bx(i)} y={PAD_T + plotH - h} width={barW} height={h} rx={Math.min(5, barW / 2)} fill={last ? colors.neon : 'url(#avHatch)'} />
                </G>
              );
            })}
            <XLabels data={data} x={(i) => (i === data.length - 1 ? bx(i) + barW : bx(i) + barW / 2)} height={height} />
          </Svg>
        );
      }}
    </Measured>
  );
}

/** Line + soft area; the line draws itself left to right. */
export function LineChart({ data, height = 170, unit = '' }: { data: Point[]; height?: number; unit?: string }) {
  const p = useProgress(seriesKey(data), 1300, 100, 'inOutQuad');
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  return (
    <Measured height={height}>
      {(width) => {
        const plotW = width - PAD_L - 8;
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
              <LinearGradient id="avArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.neon} stopOpacity={0.28} />
                <Stop offset="1" stopColor={colors.neon} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Grid width={width} plotH={plotH} max={max} unit={unit} />
            {area ? <Path d={area} fill="url(#avArea)" /> : null}
            <Path d={line} stroke={colors.neon} strokeWidth={2.2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {last && <Line x1={last[0]} x2={last[0]} y1={last[1]} y2={PAD_T + plotH} stroke={colors.neon} strokeDasharray="2 3" opacity={0.6} />}
            {last && <Circle cx={last[0]} cy={last[1]} r={8} fill={colors.neonGlow} />}
            {last && <Circle cx={last[0]} cy={last[1]} r={4.5} fill={colors.bg} stroke={colors.neon} strokeWidth={2} />}
            <XLabels data={data} x={(i) => PAD_L + i * step} height={height} />
          </Svg>
        );
      }}
    </Measured>
  );
}

// Lime → graphite shades for donut slices (largest first).
const DONUT = ['#B8FF3B', '#9BE032', '#7FC02A', '#64A022', '#4D7F1C', '#D6FF8F', '#ECEEEA', '#A9AEAA', '#6E7470', '#4A504C', '#2F3431'];

/** Donut that sweeps open, with a ranked legend. */
export function Donut({ data, size = 150, center }: { data: Point[]; size?: number; center?: { value: string; label: string } }) {
  const p = useProgress(seriesKey(data), 1200, 100, 'outCubic');
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const sorted = [...data].filter((d) => d.value > 0).sort((a, b) => b.value - a.value);
  return (
    <View style={styles.donutRow}>
      <View>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceHi} strokeWidth={14} fill="none" />
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
                  strokeWidth={14}
                  fill="none"
                  strokeDasharray={`${Math.max(0, len - 2.5)} ${c}`}
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
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  donutCenter: { alignItems: 'center', justifyContent: 'center' },
  donutValue: { color: colors.text, fontSize: 26, fontFamily: fonts.display, letterSpacing: -0.5 },
  donutLabel: { color: colors.muted, fontSize: 9, fontFamily: fonts.displayMed, textTransform: 'uppercase', letterSpacing: 1.8 },
  legend: { flex: 1, gap: 7 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { color: colors.text, flex: 1, fontSize: 12, fontFamily: fonts.bodyMed },
  legendValue: { color: colors.muted, fontSize: 12, fontFamily: fonts.displayMed, fontVariant: ['tabular-nums'] },
});
