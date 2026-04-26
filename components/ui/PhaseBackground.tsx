import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { PhaseColors, PhaseKey } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  phase: PhaseKey;
  intensity?: number;
  children?: React.ReactNode;
};

export function PhaseBackground({ phase, intensity = 1, children }: Props) {
  const p = PhaseColors[phase];
  const breath = useSharedValue(0);
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.quad) }), -1, true);
    drift1.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.linear }), -1, false);
    drift2.value = withRepeat(withTiming(1, { duration: 24000, easing: Easing.linear }), -1, false);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [0.4, 0.7]) * intensity,
    transform: [
      { translateX: interpolate(drift1.value, [0, 1], [-60, 60]) },
      { translateY: interpolate(drift1.value, [0, 1], [0, 40]) },
      { scale: interpolate(breath.value, [0, 1], [1, 1.15]) },
    ] as any,
  }));
  const orb2Style = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [0.3, 0.6]) * intensity,
    transform: [
      { translateX: interpolate(drift2.value, [0, 1], [50, -50]) },
      { translateY: interpolate(drift2.value, [0, 1], [-20, 30]) },
      { scale: interpolate(breath.value, [0, 1], [1.1, 0.95]) },
    ] as any,
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[p.bgStart, p.bgEnd] as unknown as readonly [string, string]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.orb, { left: -80, top: 80 }, orb1Style]}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          <Defs>
            <RadialGradient id="g1" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={p.primary} stopOpacity={0.6} />
              <Stop offset="100%" stopColor={p.primary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={140} cy={140} r={140} fill="url(#g1)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.orb, { right: -100, top: 260 }, orb2Style]}>
        <Svg width={320} height={320} viewBox="0 0 320 320">
          <Defs>
            <RadialGradient id="g2" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={p.secondary} stopOpacity={0.55} />
              <Stop offset="100%" stopColor={p.secondary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={160} cy={160} r={160} fill="url(#g2)" />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
  },
});
