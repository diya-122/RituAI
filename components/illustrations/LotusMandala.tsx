import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

type Props = {
  size?: number;
  color?: string;
  accent?: string;
  animated?: boolean;
};

export function LotusMandala({
  size = 240,
  color = '#7B2D3F',
  accent = '#E8A87C',
  animated = true,
}: Props) {
  const rot = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      rot.value = withRepeat(
        withTiming(1, { duration: 40000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [animated]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rot.value, [0, 1], [0, 360])}deg` }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rot.value, [0, 1], [0, -360])}deg` }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 240 240" style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="mandalaGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={accent} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={120} cy={120} r={115} fill="url(#mandalaGlow)" />
      </Svg>

      <Animated.View style={[{ position: 'absolute', width: size, height: size }, outerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 240 240">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <G key={i} rotation={angle} originX={120} originY={120}>
                <Path
                  d="M 120 40 C 105 60, 105 90, 120 120 C 135 90, 135 60, 120 40 Z"
                  fill={color}
                  opacity={0.18}
                  stroke={color}
                  strokeWidth={1.2}
                />
              </G>
            );
          })}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * (360 / 16) * Math.PI) / 180;
            const r = 108;
            const cx = 120 + r * Math.cos(angle);
            const cy = 120 + r * Math.sin(angle);
            return <Circle key={`d-${i}`} cx={cx} cy={cy} r={1.5} fill={color} opacity={0.5} />;
          })}
        </Svg>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', width: size, height: size }, innerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 240 240">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <G key={`i-${i}`} rotation={angle} originX={120} originY={120}>
                <Path
                  d="M 120 70 C 113 80, 113 100, 120 115 C 127 100, 127 80, 120 70 Z"
                  fill={accent}
                  opacity={0.35}
                />
              </G>
            );
          })}
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} viewBox="0 0 240 240" style={{ position: 'absolute' }}>
        <Circle cx={120} cy={120} r={24} fill={accent} opacity={0.25} />
        <Circle cx={120} cy={120} r={14} fill={color} opacity={0.85} />
        <Circle cx={120} cy={120} r={6} fill={accent} />
      </Svg>
    </View>
  );
}
