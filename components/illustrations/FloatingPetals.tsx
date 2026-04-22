import React, { useEffect, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

type Props = {
  count?: number;
  colors?: string[];
  height?: number;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function Petal({ size = 14, color = '#E8A87C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size * 1.5} viewBox="0 0 14 20">
      <Path
        d="M7 1 C 4 5, 2 10, 7 19 C 12 10, 10 5, 7 1 Z"
        fill={color}
        opacity={0.7}
      />
      <Path d="M7 2 C 6 7, 6 13, 7 18" stroke={color} strokeWidth={0.5} opacity={0.4} fill="none" />
    </Svg>
  );
}

export function FloatingPetals({ count = 10, colors, height }: Props) {
  const palette = colors || ['#E8A87C', '#E8B4C8', '#C9B8E8', '#F5E6D3'];
  const H = height || SCREEN_H;

  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * SCREEN_W,
        startY: Math.random() * H,
        size: 10 + Math.random() * 14,
        color: palette[i % palette.length],
        duration: 14000 + Math.random() * 12000,
        delay: Math.random() * 6000,
        drift: (Math.random() - 0.5) * 80,
      })),
    [count, H],
  );

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {petals.map((p) => (
        <DriftingPetal key={p.id} {...p} h={H} />
      ))}
    </View>
  );
}

function DriftingPetal({
  x,
  startY,
  size,
  color,
  duration,
  delay,
  drift,
  h,
}: any) {
  const y = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 1200 }));
    y.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: duration * 0.9, easing: Easing.linear }), -1, false),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.85,
    transform: [
      { translateY: interpolate(y.value, [0, 1], [startY, startY - h - 100]) },
      { translateX: interpolate(y.value, [0, 0.5, 1], [0, drift, 0]) },
      { rotate: `${interpolate(rotate.value, [0, 1], [0, 360])}deg` },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: 0 }, style]}>
      <Petal size={size} color={color} />
    </Animated.View>
  );
}
