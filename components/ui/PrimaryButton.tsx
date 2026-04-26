import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius, Shadows, Typography } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  icon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
  fullWidth = true,
}: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.2 + glow.value * 0.3,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 14, stiffness: 220 });
    glow.value = withTiming(1, { duration: 180 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    glow.value = withTiming(0, { duration: 240 });
  };
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onPress();
  };

  if (variant === 'ghost') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.ghost,
          fullWidth && { alignSelf: 'stretch' },
          aStyle,
          style,
        ]}
      >
        <Text style={styles.ghostText}>{title}</Text>
      </AnimatedPressable>
    );
  }

  const gradient =
    variant === 'gold' ? Gradients.goldShimmer : variant === 'secondary' ? Gradients.lotus : Gradients.heroNight;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        fullWidth && { alignSelf: 'stretch' },
        Shadows.medium,
        aStyle,
        style,
        disabled && { opacity: 0.4 },
      ]}
    >
      <LinearGradient
        colors={gradient as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.row}>
          {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
          <Text
            style={[
              styles.label,
              { color: variant === 'secondary' ? Colors.templeMaroon : Colors.lotusMist },
            ]}
          >
            {title}
          </Text>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: {
    ...Typography.bodyBold,
    letterSpacing: 0.5,
  },
  ghost: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.templeMaroon,
    backgroundColor: 'transparent',
  },
  ghostText: {
    ...Typography.bodyBold,
    color: Colors.templeMaroon,
  },
});
