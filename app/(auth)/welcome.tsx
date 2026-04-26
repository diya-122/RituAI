import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  WomanUnderMoon,
  TornCalendar,
  FaceWithZones,
  OvaryLotus,
  WomanWithChai,
} from '@/components/illustrations/Scenes';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors, Typography, Gradients } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');

type Scene = {
  illustration: React.ComponentType<{ size?: number; color?: string; accent?: string }>;
  title: string;
  body: string;
  gradient: readonly [string, string, ...string[]];
  illColor: string;
  illAccent: string;
  textColor: string;
};

const SCENES: Scene[] = [
  {
    illustration: WomanUnderMoon,
    title: 'You are not alone',
    body: '1 in 5 Indian women live with PCOS. Most are told it is in their head. We heard you.',
    gradient: ['#2D1B2E', '#4A2C4D', '#7B2D3F'] as const,
    illColor: '#FFF5F7',
    illAccent: '#FFD89B',
    textColor: '#FFF5F7',
  },
  {
    illustration: TornCalendar,
    title: 'Calendars lie to irregular cycles',
    body: '28-day apps fail 85% of the time. You deserve honesty, not guesses.',
    gradient: ['#7B2D3F', '#C94F5D', '#E8B4C8'] as const,
    illColor: '#FFF5F7',
    illAccent: '#FFD89B',
    textColor: '#FFF5F7',
  },
  {
    illustration: FaceWithZones,
    title: 'Your skin has been telling the story',
    body: 'Jawline acne, chin flare-ups, cystic patterns — all signals. We finally learned to read them.',
    gradient: ['#E8B4C8', '#F5E6D3', '#FFE4C4'] as const,
    illColor: '#7B2D3F',
    illAccent: '#E8A87C',
    textColor: '#2D1B2E',
  },
  {
    illustration: OvaryLotus,
    title: 'We cross-check every signal',
    body: 'LH strips lie to PCOS bodies. RituAI validates ovulation with temperature — no more false alarms.',
    gradient: ['#FFE4C4', '#E8A87C', '#C47847'] as const,
    illColor: '#7B2D3F',
    illAccent: '#FFF5F7',
    textColor: '#2D1B2E',
  },
  {
    illustration: WomanWithChai,
    title: 'Made for Indian bodies',
    body: 'Dal, ragi, methi, turmeric milk — not translated from Western apps. Your culture, your cycle.',
    gradient: ['#C47847', '#7B2D3F', '#2D1B2E'] as const,
    illColor: '#FFD89B',
    illAccent: '#FFF5F7',
    textColor: '#FFF5F7',
  },
];

export default function Welcome() {
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const handleBegin = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    router.push('/(auth)/signup');
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnightPlum }}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        decelerationRate="normal"
      >
        {SCENES.map((scene, i) => (
          <Scene key={i} scene={scene} index={i} scrollY={scrollY} />
        ))}
        {/* Final CTA screen */}
        <View style={{ height: H, width: W, alignItems: 'center', justifyContent: 'center' }}>
          <LinearGradient
            colors={Gradients.heroNight as unknown as readonly [string, string, ...string[]]}
            style={StyleSheet.absoluteFill}
          />
          <FloatingPetals count={14} colors={['#FFD89B', '#E8A87C', '#E8B4C8']} height={H} />
          <View style={{ paddingHorizontal: 32, alignItems: 'center' }}>
            <Text style={styles.finalTitle}>Your ritual is waiting.</Text>
            <Text style={styles.finalSub}>
              Smart cycle tracking. Skin-cycle intelligence. Indian diet guidance. Your health, your story.
            </Text>
            <View style={{ marginTop: 40, width: '100%' }}>
              <PrimaryButton title="Begin My Ritual" variant="gold" onPress={handleBegin} />
              <View style={{ height: 14 }} />
              <Pressable onPress={handleSkip} hitSlop={12}>
                <Text style={styles.loginText}>I already have an account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Skip button */}
      <SafeAreaView style={styles.skipWrap} edges={['top']}>
        <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Scene({
  scene,
  index,
  scrollY,
}: {
  scene: Scene;
  index: number;
  scrollY: Animated.SharedValue<number>;
}) {
  const Ill = scene.illustration;
  const inputRange = [(index - 1) * H, index * H, (index + 1) * H];

  // Background gradient fade
  const bgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP),
  }));

  // Foreground illustration (1.0x)
  const illStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, inputRange, [80, 0, -80], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, inputRange, [0.85, 1, 0.9], Extrapolation.CLAMP) },
    ] as any,
    opacity: interpolate(scrollY.value, inputRange, [0.2, 1, 0.2], Extrapolation.CLAMP),
  }));

  // Mid layer — title (0.6x)
  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, inputRange, [40, 0, -40], Extrapolation.CLAMP) },
    ] as any,
    opacity: interpolate(scrollY.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
  }));

  // Background layer — petals (0.3x)
  const petalsStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, inputRange, [20, 0, -20], Extrapolation.CLAMP) },
    ] as any,
    opacity: interpolate(scrollY.value, inputRange, [0.3, 0.9, 0.3], Extrapolation.CLAMP),
  }));

  return (
    <View style={{ height: H, width: W, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <LinearGradient colors={scene.gradient} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, petalsStyle]}>
        <FloatingPetals count={8} colors={[scene.illAccent, scene.illColor]} height={H} />
      </Animated.View>

      <Animated.View style={[styles.illWrap, illStyle]}>
        <Ill size={260} color={scene.illColor} accent={scene.illAccent} />
      </Animated.View>

      <Animated.View style={[styles.textWrap, titleStyle]}>
        <Text style={[styles.sceneTitle, { color: scene.textColor }]}>{scene.title}</Text>
        <Text style={[styles.sceneBody, { color: scene.textColor, opacity: 0.88 }]}>
          {scene.body}
        </Text>
      </Animated.View>

      <View style={styles.pageDots}>
        {SCENES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.pageDot,
              {
                backgroundColor: scene.textColor,
                opacity: i === index ? 1 : 0.3,
                width: i === index ? 22 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  illWrap: {
    position: 'absolute',
    top: H * 0.12,
    width: W,
    alignItems: 'center',
  },
  textWrap: {
    position: 'absolute',
    bottom: H * 0.18,
    width: W,
    paddingHorizontal: 32,
  },
  sceneTitle: {
    fontSize: 34,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  sceneBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  pageDots: {
    position: 'absolute',
    bottom: 60,
    width: W,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  pageDot: {
    height: 6,
    borderRadius: 3,
  },
  skipWrap: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: Colors.lotusMist,
    fontSize: 13,
    fontWeight: '600',
  },
  finalTitle: {
    fontSize: 40,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.lotusMist,
    textAlign: 'center',
    marginBottom: 16,
  },
  finalSub: {
    fontSize: 15,
    color: Colors.auroraRose,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  loginText: {
    color: Colors.auroraRose,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
