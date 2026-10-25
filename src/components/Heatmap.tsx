import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import { format } from 'date-fns';
import { colors, fonts } from '../theme';
import { heatLevel, heatmapWeeks, toKey, WEEKDAY_LABELS } from '../lib/calendar';
import { staggered, useProgress } from '../anim/hooks';

const CELL = 14;
const GAP = 3;
const LEFT = 28;
const TOP = 16;

interface Props {
  /** date key -> total sets that day */
  sets: Map<string, number>;
  today: Date;
  weeks?: number;
  onPressDay?: (dateKey: string) => void;
}

export function Heatmap({ sets, today, weeks = 26, onPressDay }: Props) {
  const scroll = useRef<ScrollViewInstance>(null);
  const grid = useMemo(() => heatmapWeeks(today, weeks), [today, weeks]);
  const todayKey = toKey(today);
  const p = useProgress(sets.size, 1100, 150, 'outQuad');

  const width = grid.length * (CELL + GAP);
  const height = TOP + 6 * (CELL + GAP);

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: false }), 0);
    return () => clearTimeout(t);
  }, [weeks]);

  // Month label at the first column whose Monday falls in a new month.
  const monthLabels = grid
    .map((w, i) => ({ i, m: w.monday.getMonth(), label: format(w.monday, 'MMM') }))
    .filter((x, idx, arr) => (idx === 0 ? arr.length > 3 && arr[3].m === x.m : x.m !== arr[idx - 1].m));

  return (
    <View>
      <View style={styles.row}>
        {/* Weekday labels stay fixed while the weeks scroll. */}
        <Svg width={LEFT} height={height}>
          {WEEKDAY_LABELS.map((d, r) =>
            r % 2 === 0 ? (
              <SvgText key={d} x={0} y={TOP + r * (CELL + GAP) + CELL - 3} fill={colors.muted} fontSize={9} letterSpacing={1} fontFamily={fonts.displayMed}>
                {d}
              </SvgText>
            ) : null,
          )}
        </Svg>
      <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
        <Svg width={width} height={height}>
          {monthLabels.map(({ i, label }) => (
            <SvgText key={i} x={i * (CELL + GAP)} y={10} fill={colors.muted} fontSize={10} fontFamily={fonts.displayMed}>
              {label}
            </SvgText>
          ))}
          {grid.map((week, c) => {
            // Cells sweep in from the most recent week backwards.
            const local = staggered(p, grid.length - 1 - c, grid.length, 0.7);
            return (
              <G key={week.days[0]} opacity={local}>
                {week.days.map((key, r) => {
                  const future = key > todayKey;
                  const n = sets.get(key) ?? 0;
                  const level = heatLevel(n);
                  const x = c * (CELL + GAP);
                  const y = TOP + r * (CELL + GAP);
                  const s = CELL * (0.4 + 0.6 * local);
                  return (
                    <Rect
                      key={key}
                      x={x + (CELL - s) / 2}
                      y={y + (CELL - s) / 2}
                      width={s}
                      height={s}
                      rx={4}
                      fill={future ? 'transparent' : colors.heat[level]}
                      stroke={key === todayKey ? colors.neon : future ? colors.border : 'transparent'}
                      strokeWidth={key === todayKey ? 1.5 : 1}
                      onPress={!future && onPressDay ? () => onPressDay(key) : undefined}
                    />
                  );
                })}
              </G>
            );
          })}
        </Svg>
      </ScrollView>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>Sundays off · sets per day</Text>
        <View style={styles.legendScale}>
          <Text style={styles.legendText}>Less</Text>
          {colors.heat.map((c) => (
            <View key={c} style={[styles.legendCell, { backgroundColor: c }]} />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  legendScale: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendCell: { width: 10, height: 10, borderRadius: 3 },
  legendText: { color: colors.muted, fontSize: 10, marginHorizontal: 2, fontFamily: fonts.body },
});
