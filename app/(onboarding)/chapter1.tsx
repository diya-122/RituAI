import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ChaiInHands } from '@/components/illustrations/Scenes';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Gradients, Typography } from '@/theme';

const LINES = [
  'Namaste.',
  'I am Saheli — your companion in this journey.',
  'I do not diagnose. I do not judge. I notice.',
  'Over time, I will learn your rhythm and help you understand your body.',
  'Shall we begin?',
];

export default function Chapter1() {
  const router = useRouter();
  const [visible, setVisible] = useState(0);
  const illOpacity = useSharedValue(0);
  const illY = useSharedValue(40);

  useEffect(() => {
    illOpacity.value = withTiming(1, { duration: 800 });
    illY.value = withSpring(0, { damping: 14, stiffness: 90 });

    LINES.forEach((_, i) => {
      setTimeout(() => setVisible(i + 1), 800 + i * 900);
    });
  }, []);

  const illStyle = useAnimatedStyle(() => ({
    opacity: illOpacity.value,
    transform: [{ translateY: illY.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.saffronDawn as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={6} colors={['#E8A87C', '#FFD89B']} />
      <OnboardingHeader step={1} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.illWrap, illStyle]}>
          <ChaiInHands size={220} />
        </Animated.View>

        <View style={styles.dialog}>
          {LINES.map((line, i) => (
            <TypewriterLine key={i} text={line} show={visible > i} index={i} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Hello, Saheli"
          variant="primary"
          onPress={() => router.push('/(onboarding)/chapter2')}
          disabled={visible < LINES.length}
        />
      </View>
    </View>
  );
}

function TypewriterLine({ text, show, index }: { text: string; show: boolean; index: number }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(10);

  useEffect(() => {
    if (show) {
      opacity.value = withTiming(1, { duration: 500 });
      y.value = withSpring(0, { damping: 16, stiffness: 120 });
    }
  }, [show]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.Text
      style={[
        styles.line,
        style,
        index === 0 && { fontSize: 28, fontStyle: 'italic', marginBottom: 12 },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 140,
    paddingTop: 10,
    alignItems: 'center',
  },
  illWrap: {
    marginVertical: 30,
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    maxWidth: 420,
  },
  line: {
    fontSize: 17,
    color: Colors.midnightPlum,
    lineHeight: 26,
    marginBottom: 10,
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
});
