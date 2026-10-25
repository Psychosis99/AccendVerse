import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type TabIconName = 'dashboard' | 'log' | 'history' | 'stats';

export function TabIcon({ name, color, size = 24 }: { name: TabIconName; color: ColorValue; size?: number }) {
  const s = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'dashboard' &&
        [0, 1, 2].flatMap((r) =>
          [0, 1, 2].map((c) => (
            <Rect key={`${r}${c}`} x={3 + c * 6.5} y={3 + r * 6.5} width={5} height={5} rx={1.2} fill={color} opacity={(r + c) % 3 === 0 ? 1 : 0.45} />
          )),
        )}
      {name === 'log' && (
        <>
          <Circle cx={12} cy={12} r={9} {...s} />
          <Line x1={12} y1={7.5} x2={12} y2={16.5} {...s} />
          <Line x1={7.5} y1={12} x2={16.5} y2={12} {...s} />
        </>
      )}
      {name === 'history' && (
        <>
          <Rect x={3.5} y={5} width={17} height={15} rx={2.5} {...s} />
          <Line x1={3.5} y1={10} x2={20.5} y2={10} {...s} />
          <Line x1={8} y1={3} x2={8} y2={7} {...s} />
          <Line x1={16} y1={3} x2={16} y2={7} {...s} />
        </>
      )}
      {name === 'stats' && <Path d="M4 20 L4 13 M10 20 L10 8 M16 20 L16 11 M22 20 L2 20 M20 20 L20 4" {...s} />}
    </Svg>
  );
}
