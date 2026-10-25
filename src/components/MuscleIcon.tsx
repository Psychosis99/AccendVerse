import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import type { MuscleId } from '../data/types';
import { colors } from '../theme';

const BODY = '#343937';
const BACK_VIEW: MuscleId[] = ['back', 'triceps', 'hamstrings', 'glutes', 'calves'];

// Limb segments in a 40×48 viewBox: [x1, y1, x2, y2]
const UPPER_ARMS = [
  [13, 11, 10.5, 20],
  [27, 11, 29.5, 20],
];
const FOREARMS = [
  [10.5, 20, 9, 28.5],
  [29.5, 20, 31, 28.5],
];
const THIGHS = [
  [17.6, 27.5, 16.8, 37],
  [22.4, 27.5, 23.2, 37],
];
const SHINS = [
  [16.8, 37, 16.4, 45.5],
  [23.2, 37, 23.6, 45.5],
];

function Limbs({ segs, color, width }: { segs: number[][]; color: string; width: number }) {
  return (
    <>
      {segs.map(([x1, y1, x2, y2], i) => (
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      ))}
    </>
  );
}

/** Highlight overlay for one muscle; drawn twice (wide translucent glow, then solid core). */
function Highlight({ muscle, color, glow }: { muscle: MuscleId; color: string; glow: boolean }) {
  const w = glow ? 2.2 : 0;
  switch (muscle) {
    case 'chest':
      return (
        <G fill={color}>
          <Ellipse cx={17.2} cy={13.8} rx={2.7 + w / 2} ry={2.1 + w / 2} />
          <Ellipse cx={22.8} cy={13.8} rx={2.7 + w / 2} ry={2.1 + w / 2} />
        </G>
      );
    case 'shoulders':
      return (
        <G fill={color}>
          <Circle cx={13.2} cy={11.2} r={2.3 + w / 2} />
          <Circle cx={26.8} cy={11.2} r={2.3 + w / 2} />
        </G>
      );
    case 'biceps':
    case 'triceps':
      return <Limbs segs={UPPER_ARMS} color={color} width={3.2 + w} />;
    case 'forearms':
      return <Limbs segs={FOREARMS} color={color} width={2.8 + w} />;
    case 'core':
      return glow ? (
        <Rect x={16.4} y={16} width={7.2} height={10.8} rx={2} fill={color} />
      ) : (
        <G fill={color}>
          {[16.8, 20.2, 23.6].map((y) => (
            <G key={y}>
              <Rect x={17.4} y={y} width={2.4} height={2.6} rx={0.6} />
              <Rect x={20.2} y={y} width={2.4} height={2.6} rx={0.6} />
            </G>
          ))}
        </G>
      );
    case 'back':
      return <Path d="M13.6 11 L26.4 11 L23.8 24 L20 26 L16.2 24 Z" fill={color} strokeWidth={w} stroke={color} />;
    case 'glutes':
      return (
        <G fill={color}>
          <Circle cx={18.1} cy={27.6} r={2.5 + w / 2} />
          <Circle cx={21.9} cy={27.6} r={2.5 + w / 2} />
        </G>
      );
    case 'quads':
    case 'hamstrings':
      return <Limbs segs={THIGHS} color={color} width={3.8 + w} />;
    case 'calves':
      return <Limbs segs={SHINS} color={color} width={3 + w} />;
  }
}

export function MuscleIcon({ muscle, size = 24, active = true }: { muscle: MuscleId; size?: number; active?: boolean }) {
  const back = BACK_VIEW.includes(muscle);
  const hl = active ? colors.neon : colors.muted;
  return (
    <Svg width={(size * 40) / 48} height={size} viewBox="0 0 40 48">
      {/* Base silhouette */}
      <Circle cx={20} cy={5} r={3.3} fill={BODY} />
      <Path d="M13 10 Q20 8.4 27 10 L24.8 27.5 L15.2 27.5 Z" fill={BODY} />
      <Limbs segs={[...UPPER_ARMS, ...FOREARMS]} color={BODY} width={3} />
      <Limbs segs={[...THIGHS, ...SHINS]} color={BODY} width={3.6} />
      {back && <Line x1={20} y1={10} x2={20} y2={26} stroke="#1C1F1F" strokeWidth={0.8} />}
      {/* Highlight with a soft glow */}
      {active && (
        <G opacity={0.35}>
          <Highlight muscle={muscle} color={colors.neon} glow />
        </G>
      )}
      <Highlight muscle={muscle} color={hl} glow={false} />
    </Svg>
  );
}
