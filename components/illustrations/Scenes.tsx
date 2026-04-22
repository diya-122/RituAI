import React from 'react';
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient as SvgLG,
  Stop,
  Ellipse,
  Rect,
} from 'react-native-svg';

type BaseProps = { size?: number; color?: string; accent?: string };

// Woman silhouette under moon — scene 1 of storytelling welcome
export function WomanUnderMoon({ size = 280, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size * 1.3} viewBox="0 0 240 312">
      <Defs>
        <SvgLG id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={accent} stopOpacity={1} />
          <Stop offset="100%" stopColor={accent} stopOpacity={0.6} />
        </SvgLG>
      </Defs>
      {/* Moon */}
      <Circle cx={120} cy={90} r={55} fill="url(#moonGrad)" opacity={0.85} />
      <Circle cx={110} cy={82} r={48} fill="#FFF5F7" opacity={0.3} />
      {/* Stars scattered */}
      {[
        [30, 40], [70, 25], [190, 55], [210, 120], [25, 170],
        [220, 25], [50, 130], [180, 180], [145, 220], [85, 250],
        [35, 260], [200, 260], [120, 280], [160, 30], [40, 80],
      ].map(([cx, cy], i) => (
        <G key={i}>
          <Circle cx={cx} cy={cy} r={1.5} fill="#FFF5F7" />
          <Circle cx={cx} cy={cy} r={5} fill="#FFF5F7" opacity={0.2} />
        </G>
      ))}
      {/* Lotus below moon */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = -90 + (i - 2) * 30;
        return (
          <G key={i} rotation={angle} originX={120} originY={200}>
            <Path
              d="M 120 170 C 113 180, 113 192, 120 200 C 127 192, 127 180, 120 170 Z"
              fill={accent}
              opacity={0.6}
              stroke={accent}
              strokeWidth={0.5}
            />
          </G>
        );
      })}
      <Circle cx={120} cy={200} r={5} fill={color} opacity={0.7} />
    </Svg>
  );
}

// Calendar pages tearing — scene 2
export function TornCalendar({ size = 260, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      {[0, 1, 2, 3].map((i) => (
        <G key={i} transform={`translate(${40 + i * 20}, ${30 + i * 18}) rotate(${i * 5 - 8})`}>
          <Rect x={0} y={0} width={120} height={140} rx={8} fill="#FFF5F7" stroke={color} strokeWidth={1.2} />
          <Rect x={0} y={0} width={120} height={24} rx={8} fill={color} opacity={0.85} />
          <Path d="M 0 100 L 20 115 L 40 105 L 60 118 L 80 108 L 100 115 L 120 102 L 120 140 L 0 140 Z" fill={accent} opacity={0.3} />
          <Circle cx={20} cy={60} r={2} fill={color} opacity={0.4} />
          <Circle cx={40} cy={60} r={2} fill={color} opacity={0.4} />
          <Circle cx={60} cy={60} r={2} fill={color} opacity={0.4} />
          <Circle cx={60} cy={60} r={6} fill={accent} opacity={0.6} />
        </G>
      ))}
    </Svg>
  );
}

// Face profile with zone mapping — scene 3
export function FaceWithZones({ size = 260, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 240 264">
      {/* Face outline */}
      <Path
        d="M 120 20 Q 70 25, 65 90 Q 60 140, 75 180 Q 85 210, 120 230 Q 155 210, 165 180 Q 180 140, 175 90 Q 170 25, 120 20 Z"
        fill="#FFF5F7"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.95}
      />
      {/* Hair */}
      <Path
        d="M 75 60 Q 55 30, 85 15 Q 120 0, 155 15 Q 185 30, 165 60 Q 170 40, 140 35 Q 120 30, 100 35 Q 70 40, 75 60 Z"
        fill={color}
        opacity={0.9}
      />
      {/* Eyes */}
      <Circle cx={95} cy={110} r={3} fill={color} />
      <Circle cx={145} cy={110} r={3} fill={color} />
      {/* Nose */}
      <Path d="M 118 130 Q 115 150, 120 160 Q 125 162, 128 158" stroke={color} strokeWidth={1.5} fill="none" opacity={0.6} />
      {/* Lips */}
      <Path d="M 105 185 Q 120 190, 135 185" stroke={color} strokeWidth={1.5} fill="none" />
      {/* Zone markers - gold acne constellation */}
      {[
        [120, 80, 'forehead'],
        [90, 130, 'L cheek'],
        [150, 130, 'R cheek'],
        [120, 200, 'chin'],
        [100, 215, 'jaw'],
        [140, 215, 'jaw'],
      ].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x as number} cy={y as number} r={8} fill={accent} opacity={0.2} />
          <Circle cx={x as number} cy={y as number} r={4} fill={accent} opacity={0.7} />
          <Circle cx={x as number} cy={y as number} r={1.5} fill={accent} />
        </G>
      ))}
      {/* Gold constellation lines */}
      <Path
        d="M 120 80 L 90 130 L 120 200 L 150 130 Z M 100 215 L 140 215"
        stroke={accent}
        strokeWidth={0.8}
        fill="none"
        opacity={0.5}
        strokeDasharray="3,3"
      />
    </Svg>
  );
}

// Ovary with blooming lotus — scene 4
export function OvaryLotus({ size = 260, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      {/* Uterus / ovary outline */}
      <Path
        d="M 120 40 Q 90 50, 80 90 Q 70 140, 90 180 Q 110 210, 120 210 Q 130 210, 150 180 Q 170 140, 160 90 Q 150 50, 120 40 Z"
        fill="#FFF5F7"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.9}
      />
      {/* Side ovaries */}
      <Ellipse cx={70} cy={130} rx={18} ry={24} fill="#FFE4C4" stroke={color} strokeWidth={1.2} opacity={0.85} />
      <Ellipse cx={170} cy={130} rx={18} ry={24} fill="#FFE4C4" stroke={color} strokeWidth={1.2} opacity={0.85} />
      {/* Pomegranate-seed cysts (gentle) */}
      {[
        [65, 125],
        [75, 135],
        [72, 120],
        [165, 125],
        [175, 135],
        [168, 128],
      ].map(([cx, cy], i) => (
        <Circle key={i} cx={cx} cy={cy} r={2.5} fill={color} opacity={0.6} />
      ))}
      {/* Lotus blooming in center */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        return (
          <G key={i} rotation={angle} originX={120} originY={130}>
            <Path
              d="M 120 100 C 112 115, 112 130, 120 140 C 128 130, 128 115, 120 100 Z"
              fill={accent}
              opacity={0.55}
              stroke={accent}
              strokeWidth={0.5}
            />
          </G>
        );
      })}
      <Circle cx={120} cy={130} r={10} fill={color} opacity={0.85} />
      <Circle cx={120} cy={130} r={5} fill={accent} />
    </Svg>
  );
}

// Woman with chai + Indian foods — scene 5
export function WomanWithChai({ size = 260, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      {/* Steam */}
      <Path d="M 115 40 Q 110 30, 115 20 Q 120 10, 115 0" stroke={accent} strokeWidth={1.5} fill="none" opacity={0.4} strokeLinecap="round" />
      <Path d="M 125 40 Q 130 30, 125 20 Q 120 10, 125 0" stroke={accent} strokeWidth={1.5} fill="none" opacity={0.4} strokeLinecap="round" />
      {/* Brass tumbler */}
      <Path d="M 95 50 Q 95 90, 100 110 L 140 110 Q 145 90, 145 50 Z" fill={accent} opacity={0.85} stroke={color} strokeWidth={1.2} />
      <Ellipse cx={120} cy={50} rx={25} ry={5} fill="#7B2D3F" opacity={0.9} />
      {/* Hands */}
      <Path d="M 80 100 Q 85 115, 95 110 M 160 100 Q 155 115, 145 110" stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* Body silhouette */}
      <Path
        d="M 70 130 Q 80 150, 80 200 L 160 200 Q 160 150, 170 130 Q 165 120, 140 125 Q 120 128, 100 125 Q 75 120, 70 130 Z"
        fill={color}
        opacity={0.85}
      />
      {/* Plate of dal+roti around */}
      <Circle cx={40} cy={180} r={18} fill="#FFE4C4" stroke={color} strokeWidth={1} opacity={0.9} />
      <Circle cx={40} cy={180} r={10} fill={accent} opacity={0.5} />
      <Circle cx={200} cy={180} r={18} fill="#FFF5F7" stroke={color} strokeWidth={1} opacity={0.9} />
      <Path d="M 192 175 Q 200 180, 208 175 M 192 182 Q 200 185, 208 182" stroke={color} strokeWidth={0.8} opacity={0.5} />
      {/* Methi leaf */}
      <Path d="M 30 150 Q 35 145, 40 148 Q 38 155, 30 150 Z" fill="#8BA888" opacity={0.8} />
      <Path d="M 200 150 Q 205 145, 210 148 Q 208 155, 200 150 Z" fill="#8BA888" opacity={0.8} />
    </Svg>
  );
}

// Moon phases arc — used in onboarding Ch2
export function MoonPhasesArc({ size = 280, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size * 0.5} viewBox="0 0 280 140">
      {/* Arc background */}
      <Path d="M 20 120 Q 140 20, 260 120" stroke={color} strokeWidth={0.5} fill="none" opacity={0.3} strokeDasharray="3,3" />
      {[
        { x: 20, y: 120, fill: color, inner: color },
        { x: 80, y: 70, fill: color, inner: '#FFF5F7' },
        { x: 140, y: 30, fill: '#FFF5F7', inner: '#FFF5F7' },
        { x: 200, y: 70, fill: '#FFF5F7', inner: color },
        { x: 260, y: 120, fill: color, inner: color },
      ].map((m, i) => (
        <G key={i}>
          <Circle cx={m.x} cy={m.y} r={18} fill="#FFE4C4" opacity={0.3} />
          <Circle cx={m.x} cy={m.y} r={14} fill={m.fill} stroke={accent} strokeWidth={1.5} />
          {i === 1 && <Path d={`M ${m.x} ${m.y - 14} A 14 14 0 0 0 ${m.x} ${m.y + 14} Z`} fill={m.inner} />}
          {i === 3 && <Path d={`M ${m.x} ${m.y - 14} A 14 14 0 0 1 ${m.x} ${m.y + 14} Z`} fill={m.inner} />}
        </G>
      ))}
    </Svg>
  );
}

// Chai cup in hands — onboarding Ch1
export function ChaiInHands({ size = 240, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 240 216">
      {/* Steam swirls */}
      {[0, 1, 2].map((i) => (
        <Path
          key={i}
          d={`M ${95 + i * 20} 40 Q ${90 + i * 20} 20, ${100 + i * 20} 10`}
          stroke={accent}
          strokeWidth={2}
          fill="none"
          opacity={0.5}
          strokeLinecap="round"
        />
      ))}
      {/* Cup */}
      <Path d="M 80 60 Q 80 110, 90 130 L 150 130 Q 160 110, 160 60 Z" fill={accent} opacity={0.7} stroke={color} strokeWidth={1.5} />
      <Ellipse cx={120} cy={60} rx={40} ry={7} fill={color} opacity={0.8} />
      <Ellipse cx={120} cy={60} rx={35} ry={5} fill="#5C1D2C" />
      {/* Handle */}
      <Path d="M 160 75 Q 180 85, 165 110" stroke={color} strokeWidth={3} fill="none" />
      {/* Hands cradling */}
      <Path d="M 60 130 Q 70 155, 90 150 L 150 150 Q 170 155, 180 130" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Circle cx={70} cy={135} r={5} fill={color} opacity={0.8} />
      <Circle cx={170} cy={135} r={5} fill={color} opacity={0.8} />
      {/* Floating lotus */}
      <G transform="translate(30, 150)">
        <Circle cx={0} cy={0} r={15} fill={accent} opacity={0.3} />
        <Path d="M 0 -10 C -4 -3, -4 3, 0 10 C 4 3, 4 -3, 0 -10 Z" fill={accent} opacity={0.7} />
      </G>
    </Svg>
  );
}

// Scroll of consent — onboarding Ch5
export function ConsentScroll({ size = 240, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 240 216">
      <Path
        d="M 40 30 Q 30 40, 30 100 Q 30 160, 40 180 L 200 180 Q 210 160, 210 100 Q 210 40, 200 30 Z"
        fill="#FFF5F7"
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Rolled edges */}
      <Ellipse cx={40} cy={105} rx={10} ry={75} fill={color} opacity={0.85} />
      <Ellipse cx={200} cy={105} rx={10} ry={75} fill={color} opacity={0.85} />
      {/* Text lines */}
      {[65, 85, 105, 125, 145].map((y, i) => (
        <Path key={i} d={`M 60 ${y} L ${180 - i * 10} ${y}`} stroke={color} strokeWidth={1} opacity={0.4} />
      ))}
      {/* Wax seal lotus */}
      <Circle cx={120} cy={165} r={14} fill={accent} opacity={0.85} />
      <Path d="M 120 155 C 114 162, 114 168, 120 175 C 126 168, 126 162, 120 155 Z" fill={color} opacity={0.9} />
    </Svg>
  );
}

// Simple lotus — used as brand mark
export function LotusMark({ size = 80, color = '#7B2D3F', accent = '#E8A87C' }: BaseProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = -90 + (i - 2) * 35;
        return (
          <G key={i} rotation={angle} originX={40} originY={55}>
            <Path d="M 40 20 C 32 35, 32 45, 40 55 C 48 45, 48 35, 40 20 Z" fill={accent} opacity={0.85} stroke={color} strokeWidth={0.8} />
          </G>
        );
      })}
      <Path d="M 20 55 Q 40 62, 60 55" stroke={color} strokeWidth={1.5} fill="none" />
      <Circle cx={40} cy={55} r={4} fill={color} />
    </Svg>
  );
}
