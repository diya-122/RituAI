import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { MoonPhasesArc } from '@/components/illustrations/Scenes';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Gradients, Typography, Radius } from '@/theme';

const RHYTHM_OPTIONS = [
  { id: 'clockwork', title: 'Clockwork', desc: '28-31 days, predictable', emoji: '⏱' },
  { id: 'sometimes', title: 'Sometimes surprising', desc: 'Varies slightly month to month', emoji: '〰️' },
  { id: 'unpredictable', title: 'Unpredictable', desc: 'Hard to predict, often irregular', emoji: '🌀' },
];

export default function Chapter2() {
  const router = useRouter();
  const [periodLength, setPeriodLength] = useState(5);
  const [rhythm, setRhythm] = useState<string | null>(null);

  const canContinue = rhythm !== null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.lotus as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={5} colors={['#C9B8E8', '#E8B4C8']} />
      <OnboardingHeader step={2} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.illWrap}>
          <MoonPhasesArc size={280} />
        </View>

        <Text style={styles.title}>Your body's rhythm</Text>
        <Text style={styles.sub}>
          No pressure for perfect answers. We adapt as we learn you.
        </Text>

        <GlassCard style={{ marginTop: 22 }}>
          <Text style={styles.question}>How many days do your periods usually last?</Text>
          <View style={styles.sliderRow}>
            {[2, 3, 4, 5, 6, 7, 8].map((d) => (
              <DropPicker
                key={d}
                active={d === periodLength}
                value={d}
                onPress={() => {
                  try { Haptics.selectionAsync(); } catch {}
                  setPeriodLength(d);
                }}
              />
            ))}
          </View>
        </GlassCard>

        <GlassCard style={{ marginTop: 16 }}>
          <Text style={styles.question}>Are your cycles regular?</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {RHYTHM_OPTIONS.map((opt) => (
              <RhythmCard
                key={opt.id}
                option={opt}
                selected={rhythm === opt.id}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setRhythm(opt.id);
                }}
              />
            ))}
          </View>
        </GlassCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          variant="primary"
          disabled={!canContinue}
          onPress={() => router.push('/(onboarding)/chapter3')}
        />
      </View>
    </View>
  );
}

function DropPicker({ value, active, onPress }: { value: number; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(1.15, { damping: 10, stiffness: 200 }, () => {
          scale.value = withSpring(1);
        });
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.drop,
          aStyle,
          active && {
            backgroundColor: Colors.templeMaroon,
            borderColor: Colors.templeMaroon,
          },
        ]}
      >
        <Text style={[styles.dropText, active && { color: Colors.lotusMist }]}>{value}</Text>
      </Animated.View>
    </Pressable>
  );
}

function RhythmCard({ option, selected, onPress }: any) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(0.97, { damping: 12 }, () => {
          scale.value = withSpring(1);
        });
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.rhythmCard,
          aStyle,
          selected && {
            borderColor: Colors.templeMaroon,
            backgroundColor: 'rgba(232,168,124,0.25)',
          },
        ]}
      >
        <Text style={{ fontSize: 24, marginRight: 12 }}>{option.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rhythmTitle}>{option.title}</Text>
          <Text style={styles.rhythmDesc}>{option.desc}</Text>
        </View>
        {selected && <Text style={styles.check}>✓</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  illWrap: { alignItems: 'center', marginVertical: 14 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  question: {
    ...Typography.bodyBold,
    color: Colors.midnightPlum,
    marginBottom: 6,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  drop: {
    width: 40,
    height: 52,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.2,
    borderColor: 'rgba(123,45,63,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropText: {
    fontWeight: '700',
    color: Colors.templeMaroon,
    fontSize: 16,
  },
  rhythmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(123,45,63,0.15)',
  },
  rhythmTitle: {
    ...Typography.bodyBold,
    color: Colors.templeMaroon,
  },
  rhythmDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    color: Colors.templeMaroon,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
});
