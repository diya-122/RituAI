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
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Gradients, Typography, Radius } from '@/theme';

const ACTIVITY = [
  { id: 'sedentary', emoji: '🪑', label: 'Sedentary' },
  { id: 'light', emoji: '🧘', label: 'Light yoga' },
  { id: 'regular', emoji: '🚶‍♀️', label: 'Regular' },
  { id: 'athlete', emoji: '🏃‍♀️', label: 'Athlete' },
];

const DIET = ['Vegetarian', 'Jain', 'Vegan', 'Eggetarian', 'Non-veg', 'Gluten-free'];

export default function Chapter3() {
  const router = useRouter();
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [activity, setActivity] = useState<string | null>(null);
  const [diet, setDiet] = useState<string[]>([]);

  const toggleDiet = (d: string) => {
    try { Haptics.selectionAsync(); } catch {}
    setDiet((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const canContinue = activity !== null && diet.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.emerald as unknown as readonly [string, string]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={5} colors={['#8BA888', '#E8B4C8']} />
      <OnboardingHeader step={3} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your daily life</Text>
        <Text style={styles.sub}>This helps me tailor recommendations to your actual world.</Text>

        <GlassCard style={{ marginTop: 20 }}>
          <Text style={styles.question}>How stressed have you felt lately?</Text>
          <Slider value={stress} onChange={setStress} min={1} max={10} />
          <Text style={styles.sliderLabel}>
            {stress <= 3 ? 'Calm' : stress <= 6 ? 'Balanced' : stress <= 8 ? 'Tense' : 'Overwhelmed'}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginTop: 14 }}>
          <Text style={styles.question}>Average hours of sleep?</Text>
          <Slider value={sleep} onChange={setSleep} min={3} max={12} />
          <Text style={styles.sliderLabel}>{sleep} hrs</Text>
        </GlassCard>

        <GlassCard style={{ marginTop: 14 }}>
          <Text style={styles.question}>Activity level</Text>
          <View style={styles.grid4}>
            {ACTIVITY.map((a) => (
              <ActivityCard
                key={a.id}
                item={a}
                selected={activity === a.id}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setActivity(a.id);
                }}
              />
            ))}
          </View>
        </GlassCard>

        <GlassCard style={{ marginTop: 14, marginBottom: 40 }}>
          <Text style={styles.question}>Dietary preferences</Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>Pick all that apply</Text>
          <View style={styles.chipRow}>
            {DIET.map((d) => (
              <Chip key={d} label={d} selected={diet.includes(d)} onPress={() => toggleDiet(d)} />
            ))}
          </View>
        </GlassCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          disabled={!canContinue}
          onPress={() => router.push('/(onboarding)/chapter4')}
        />
      </View>
    </View>
  );
}

function Slider({ value, onChange, min, max }: any) {
  const positions = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.sliderTrack}>
      {positions.map((p) => (
        <Pressable
          key={p}
          onPress={() => {
            try { Haptics.selectionAsync(); } catch {}
            onChange(p);
          }}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <View
            style={[
              styles.sliderDot,
              p <= value && { backgroundColor: Colors.templeMaroon },
              p === value && { transform: [{ scale: 1.6 }] },
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
}

function ActivityCard({ item, selected, onPress }: any) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(0.95, { damping: 12 }, () => {
          scale.value = withSpring(1);
        });
        onPress();
      }}
      style={{ width: '48%' }}
    >
      <Animated.View
        style={[
          styles.actCard,
          aStyle,
          selected && {
            borderColor: Colors.templeMaroon,
            backgroundColor: 'rgba(232,168,124,0.3)',
          },
        ]}
      >
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
        <Text style={styles.actLabel}>{item.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function Chip({ label, selected, onPress }: any) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.chip,
          selected && {
            backgroundColor: Colors.saffronGold,
            borderColor: Colors.templeMaroon,
          },
        ]}
      >
        <Text style={[styles.chipText, selected && { color: Colors.midnightPlum, fontWeight: '700' }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
    textAlign: 'center',
    marginTop: 8,
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  question: {
    ...Typography.bodyBold,
    color: Colors.midnightPlum,
  },
  sliderTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    height: 28,
  },
  sliderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(123,45,63,0.25)',
  },
  sliderLabel: {
    textAlign: 'right',
    color: Colors.templeMaroon,
    fontWeight: '600',
    marginTop: 4,
  },
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  actCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(123,45,63,0.15)',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 6,
  },
  actLabel: {
    marginTop: 6,
    color: Colors.templeMaroon,
    fontWeight: '600',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.2,
    borderColor: 'rgba(123,45,63,0.2)',
  },
  chipText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
});
