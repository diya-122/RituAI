import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows } from '@/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  radius?: number;
  padding?: number;
  glow?: boolean;
};

export function GlassCard({
  children,
  style,
  intensity = 40,
  tint = 'light',
  radius = Radius.lg,
  padding = 20,
  glow = false,
}: Props) {
  // BlurView on web falls back gracefully, but we still want a visible surface
  const content = (
    <View style={[styles.inner, { padding, borderRadius: radius }]}>{children}</View>
  );

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.webFallback,
          { borderRadius: radius },
          glow && Shadows.glow,
          !glow && Shadows.medium,
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, glow && Shadows.glow, !glow && Shadows.medium, style]}>
      <BlurView intensity={intensity} tint={tint} style={[styles.blur, { borderRadius: radius }]}>
        <View style={[styles.tint, { borderRadius: radius }]}>{content}</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  tint: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inner: {
    width: '100%',
  },
  webFallback: {
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
});
