import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LotusMandala } from '@/components/illustrations/LotusMandala';
import { Colors, Gradients } from '@/theme';
import { useStore } from '@/store/useStore';

const { height: H } = Dimensions.get('window');

export default function SplashGate() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const isAuthed = useStore((s) => s.isAuthed);
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const user = useStore((s) => s.user);
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  const mandalaScale = useSharedValue(0);
  const mandalaOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const dotScale = useSharedValue(1);

  useEffect(() => {
    dotScale.value = withSequence(
      withTiming(1.4, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 400 }),
    );
    mandalaOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));
    mandalaScale.value = withDelay(500, withSpring(1, { damping: 12, stiffness: 90 }));
    titleOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(1400, withSpring(0, { damping: 14, stiffness: 120 }));
    taglineOpacity.value = withDelay(2000, withTiming(1, { duration: 600 }));

    const t = setTimeout(() => setReadyToNavigate(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Only navigate once navigation is mounted AND splash animation finished
  useEffect(() => {
    if (!readyToNavigate) return;
    if (!navState?.key) return; // navigation not ready yet
    if (!isAuthed) router.replace('/(auth)/welcome');
    else if (user?.role === 'ADMIN') router.replace('/admin');
    else if (!hasOnboarded) router.replace('/(onboarding)/chapter1');
    else router.replace('/(tabs)/today');
  }, [readyToNavigate, navState?.key, isAuthed, hasOnboarded, user?.role]);

  const mandalaStyle = useAnimatedStyle(() => ({
    opacity: mandalaOpacity.value,
    transform: [{ scale: mandalaScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: interpolate(mandalaOpacity.value, [0, 1], [1, 0]),
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.heroNight as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.dot, dotStyle]} />
      <Animated.View style={[styles.mandalaWrap, mandalaStyle]}>
        <LotusMandala size={260} color="#E8A87C" accent="#FFD89B" animated />
      </Animated.View>
      <Animated.View style={[styles.titleWrap, titleStyle]}>
        <Text style={styles.title}>RituAI</Text>
      </Animated.View>
      <Animated.View style={[styles.taglineWrap, taglineStyle]}>
        <Text style={styles.tagline}>Your phone. Your body. Your intelligence.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E8A87C',
    shadowColor: '#E8A87C',
    shadowOpacity: 0.9,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  mandalaWrap: {
    position: 'absolute',
    top: H / 2 - 180,
  },
  titleWrap: {
    position: 'absolute',
    top: H / 2 + 100,
  },
  title: {
    fontSize: 56,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.lotusMist,
    letterSpacing: -1,
  },
  taglineWrap: {
    position: 'absolute',
    top: H / 2 + 180,
  },
  tagline: {
    fontSize: 14,
    color: Colors.auroraRose,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
