import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  Rect,
  Defs,
  RadialGradient,
  LinearGradient as SvgLG,
  Stop,
  Circle,
  G,
  Ellipse,
} from 'react-native-svg';
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
  open?: boolean;
};

export function Doorway({ size = 260, open = false }: Props) {
  const glow = useSharedValue(0);
  const doorSwing = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    doorSwing.value = withTiming(open ? 1 : 0, {
      duration: open ? 900 : 400,
      easing: open ? Easing.out(Easing.cubic) : Easing.inOut(Easing.quad),
    });
  }, [open]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.4, 0.9]),
  }));

  const leftDoorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(doorSwing.value, [0, 1], [0, -70]) }],
    opacity: interpolate(doorSwing.value, [0, 1], [1, 0]),
  }));
  const rightDoorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(doorSwing.value, [0, 1], [0, 70]) }],
    opacity: interpolate(doorSwing.value, [0, 1], [1, 0]),
  }));

  const lightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(doorSwing.value, [0, 0.4, 1], [0, 0.6, 1]),
    transform: [{ scale: interpolate(doorSwing.value, [0, 1], [0.3, 1.1]) }],
  }));

  return (
    <View style={{ width: size, height: size * 1.2, alignItems: 'center', justifyContent: 'center' }}>
      {/* Ambient glow */}
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, glowStyle]}>
        <Svg width={size} height={size} viewBox="0 0 260 260">
          <Defs>
            <RadialGradient id="doorGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#E8A87C" stopOpacity={0.7} />
              <Stop offset="100%" stopColor="#E8A87C" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={130} cy={130} r={130} fill="url(#doorGlow)" />
        </Svg>
      </Animated.View>

      {/* Light escaping */}
      <Animated.View style={[{ position: 'absolute', width: size, height: size * 1.2 }, lightStyle]}>
        <Svg width={size} height={size * 1.2} viewBox="0 0 260 312">
          <Defs>
            <SvgLG id="escape" x1="50%" y1="0%" x2="50%" y2="100%">
              <Stop offset="0%" stopColor="#FFF5F7" stopOpacity={0} />
              <Stop offset="30%" stopColor="#FFD89B" stopOpacity={0.55} />
              <Stop offset="60%" stopColor="#FFD89B" stopOpacity={0.85} />
              <Stop offset="100%" stopColor="#FFF5F7" stopOpacity={0} />
            </SvgLG>
          </Defs>
          <Path d="M 90 40 L 170 40 L 210 310 L 50 310 Z" fill="url(#escape)" />
        </Svg>
      </Animated.View>

      {/* Doorway frame */}
      <Svg width={size} height={size * 1.2} viewBox="0 0 260 312" style={{ position: 'absolute' }}>
        <Defs>
          <SvgLG id="frameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#C47847" />
            <Stop offset="100%" stopColor="#7B2D3F" />
          </SvgLG>
        </Defs>
        <Path
          d="M 40 280 L 40 120 Q 40 40, 130 40 Q 220 40, 220 120 L 220 280"
          stroke="url(#frameGrad)"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        <Rect x={36} y={278} width={188} height={8} rx={2} fill="#7B2D3F" />
        <G>
          <Circle cx={130} cy={76} r={18} fill="#FFD89B" opacity={0.25} />
          <Path d="M 130 60 C 125 68, 125 78, 130 92 C 135 78, 135 68, 130 60 Z" fill="#E8A87C" opacity={0.7} />
        </G>
      </Svg>

      {/* Left door */}
      <Animated.View style={[{ position: 'absolute', width: size, height: size * 1.2 }, leftDoorStyle]}>
        <Svg width={size} height={size * 1.2} viewBox="0 0 260 312">
          <Defs>
            <SvgLG id="leftDoor" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4A2C4D" />
              <Stop offset="100%" stopColor="#7B2D3F" />
            </SvgLG>
          </Defs>
          <Path d="M 48 278 L 48 120 Q 48 48, 130 48 L 130 278 Z" fill="url(#leftDoor)" stroke="#C47847" strokeWidth={1.5} />
          <Path d="M 70 100 L 120 100 L 120 260 L 70 260 Z" stroke="#E8A87C" strokeWidth={0.8} fill="none" opacity={0.5} />
          <Circle cx={118} cy={195} r={3} fill="#FFD89B" />
        </Svg>
      </Animated.View>

      {/* Right door */}
      <Animated.View style={[{ position: 'absolute', width: size, height: size * 1.2 }, rightDoorStyle]}>
        <Svg width={size} height={size * 1.2} viewBox="0 0 260 312">
          <Defs>
            <SvgLG id="rightDoor" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#7B2D3F" />
              <Stop offset="100%" stopColor="#4A2C4D" />
            </SvgLG>
          </Defs>
          <Path d="M 130 48 Q 212 48, 212 120 L 212 278 L 130 278 Z" fill="url(#rightDoor)" stroke="#C47847" strokeWidth={1.5} />
          <Path d="M 140 100 L 190 100 L 190 260 L 140 260 Z" stroke="#E8A87C" strokeWidth={0.8} fill="none" opacity={0.5} />
          <Circle cx={142} cy={195} r={3} fill="#FFD89B" />
        </Svg>
      </Animated.View>
    </View>
  );
}
