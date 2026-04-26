import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { Colors, PhaseColors, PhaseKey, Typography } from '@/theme';

type Props = {
  phase: PhaseKey;
  day: number;
  cycleLength?: number;
  size?: number;
};

export function PhaseRing({ phase, day, cycleLength = 28, size = 300 }: Props) {
  const p = PhaseColors[phase];
  const pulse = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 3500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    rotate.value = withRepeat(
      withTiming(1, { duration: 60000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0.9]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.04]) }],
  }));
  const mandalaStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotate.value, [0, 1], [0, 360])}deg` }],
  }));

  const center = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.36;

  const segments = Array.from({ length: cycleLength }).map((_, i) => {
    const angle = (i / cycleLength) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const x1 = center + outerR * Math.cos(rad);
    const y1 = center + outerR * Math.sin(rad);
    const x2 = center + (outerR + 10) * Math.cos(rad);
    const y2 = center + (outerR + 10) * Math.sin(rad);
    const filled = i < day;
    return { x1, y1, x2, y2, filled, i };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow halo */}
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="ringGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={p.primary} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={p.secondary} stopOpacity={0.6} />
            </LinearGradient>
          </Defs>
          <Circle cx={center} cy={center} r={outerR + 20} fill="url(#ringGlow)" />
        </Svg>
      </Animated.View>

      {/* Static outer ring + segments */}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={outerR + 4}
          stroke={p.accent}
          strokeWidth={1}
          fill="none"
          opacity={0.3}
        />
        <Circle
          cx={center}
          cy={center}
          r={innerR}
          stroke={p.accent}
          strokeWidth={0.5}
          fill="none"
          opacity={0.2}
        />
        {segments.map((s) => (
          <G key={s.i}>
            <Circle
              cx={s.x2}
              cy={s.y2}
              r={s.i === day - 1 ? 5 : 2.5}
              fill={s.filled ? p.primary : p.secondary}
              opacity={s.filled ? 1 : 0.35}
            />
          </G>
        ))}
      </Svg>

      {/* Rotating inner mandala */}
      <Animated.View style={[{ position: 'absolute' }, mandalaStyle]}>
        <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 200 200">
          {Array.from({ length: 6 }).map((_, i) => (
            <G key={i} rotation={(i * 360) / 6} originX={100} originY={100}>
              <Circle cx={100} cy={50} r={3} fill={p.accent} opacity={0.5} />
            </G>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <G key={`s-${i}`} rotation={(i * 360) / 12} originX={100} originY={100}>
              <Circle cx={100} cy={80} r={1.5} fill={p.primary} opacity={0.3} />
            </G>
          ))}
        </Svg>
      </Animated.View>

      {/* Center number + phase label */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[styles.dayNumber, { color: p.accent }]}>{day}</Text>
        <Text style={[styles.dayLabel, { color: Colors.textSecondary }]}>DAY OF CYCLE</Text>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseEmoji}>{p.emoji}</Text>
          <Text style={[styles.phaseName, { color: p.accent }]}>{p.name.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayNumber: {
    ...Typography.numeral,
    textAlign: 'center',
  },
  dayLabel: {
    ...Typography.label,
    marginTop: -6,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  phaseEmoji: { fontSize: 14, marginRight: 6 },
  phaseName: {
    ...Typography.label,
    fontSize: 11,
  },
});
