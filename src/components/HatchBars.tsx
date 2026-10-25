import { useId, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, G, Line, Pattern, Rect } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { staggered, useProgress } from '../anim/hooks';

interface Bar {
  label: string;
  value: number;
}

/**
 * Striped bars with one highlighted bar and a callout above it, in the style of the
 * reference "activity" chart. Bars grow in with an anime.js stagger.
 */
export function HatchBars({
  data,
  highlight,
  callout,
  height = 150,
  footer,
}: {
  data: Bar[];
  highlight: number;
  callout?: string;
  height?: number;
  footer?: { left?: string; right?: string };
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [width, setWidth] = useState(0);
  const p = useProgress(data.map((d) => d.value).join(','), 1100, 150, 'outExpo');
  const max = Math.max(1, ...data.map((d) => d.value));
  const top = callout ? 34 : 6;
  const plotH = height - top;
  const slot = width / Math.max(1, data.length);
  const barW = Math.min(30, slot * 0.5);

  const hl = data[highlight];
  const hlH = hl ? Math.max(6, (hl.value / max) * plotH) * staggered(p, highlight, data.length, 0.5) : 0;
  const hlX = highlight * slot + slot / 2;

  return (
    <View>
      <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width))}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <Pattern id={`h${id}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                <Rect width={6} height={6} fill={colors.surfaceHi} />
                <Line x1={0} y1={0} x2={0} y2={6} stroke={colors.muted} strokeWidth={2.2} opacity={0.6} />
              </Pattern>
              <Pattern id={`l${id}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                <Rect width={6} height={6} fill={colors.neon} />
                <Line x1={0} y1={0} x2={0} y2={6} stroke={colors.onNeon} strokeWidth={1.6} opacity={0.55} />
              </Pattern>
            </Defs>
            {data.map((d, i) => {
              const h = Math.max(d.value > 0 ? 6 : 3, (d.value / max) * plotH) * staggered(p, i, data.length, 0.5);
              const x = i * slot + (slot - barW) / 2;
              const on = i === highlight;
              return (
                <G key={i}>
                  {on && <Rect x={x - 4} y={top + plotH - h - 4} width={barW + 8} height={h + 4} rx={8} fill={colors.neonGlow} />}
                  <Rect x={x} y={top + plotH - h} width={barW} height={h} rx={5} fill={`url(#${on ? 'l' : 'h'}${id})`} />
                </G>
              );
            })}
            {hl && callout && hlH > 0 && (
              <Line x1={hlX} x2={hlX} y1={26} y2={top + plotH - hlH - 6} stroke={colors.neon} strokeWidth={1.2} strokeDasharray="2 3" />
            )}
          </Svg>
        )}
        {width > 0 && hl && callout ? (
          <View style={[styles.callout, { left: Math.min(Math.max(0, hlX - 60), width - 120) }]}>
            <Text style={styles.calloutText} numberOfLines={1}>
              {callout}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.axis}>
        {data.map((d, i) => (
          <Text key={i} style={[styles.axisLabel, i === highlight && { color: colors.neon }]}>
            {d.label}
          </Text>
        ))}
      </View>
      {footer && (
        <View style={styles.footer}>
          <Text style={styles.footText}>{footer.left}</Text>
          <Text style={[styles.footText, { color: colors.sub }]}>{footer.right}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  callout: { position: 'absolute', top: 0, width: 120, alignItems: 'center' },
  calloutText: {
    fontFamily: fonts.displayMed,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.onNeon,
    backgroundColor: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  axis: { flexDirection: 'row', marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  axisLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.displayMed, fontSize: 10, color: colors.muted, letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footText: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
});
