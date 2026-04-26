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

const INDICATORS = [
  { id: 'jawlineAcne', emoji: '🪞', title: 'Jawline or chin acne' },
  { id: 'hairGrowth', emoji: '🌿', title: 'Unusual hair growth' },
  { id: 'hairThinning', emoji: '🧵', title: 'Hair thinning on scalp' },
  { id: 'weightChanges', emoji: '⚖️', title: 'Unexplained weight changes' },
  { id: 'missedCycles', emoji: '📆', title: 'Missed cycles' },
  { id: 'moodSwings', emoji: '🌊', title: 'Mood swings' },
  { id: 'darkPatches', emoji: '🌙', title: 'Dark skin patches' },
];

export default function Chapter4() {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.moonlit as unknown as readonly [string, string, string]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={4} colors={['#C9B8E8', '#E8B4C8']} />
      <OnboardingHeader step={4} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your signals</Text>
        <Text style={styles.sub}>
          Some questions are personal. Skip anything. Nothing here is judgment — it is context.
        </Text>

        <GlassCard style={{ marginTop: 20 }}>
          <View style={{ gap: 10 }}>
            {INDICATORS.map((ind) => (
              <IndicatorCard
                key={ind.id}
                item={ind}
                selected={!!selected[ind.id]}
                onPress={() => toggle(ind.id)}
              />
            ))}
          </View>
        </GlassCard>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            🪷 Saheli: "Whatever you share, I hold gently. I will never judge your body."
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/chapter5')} />
      </View>
    </View>
  );
}

function IndicatorCard({ item, selected, onPress }: any) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
          styles.indCard,
          aStyle,
          selected && {
            borderColor: Colors.saffronGold,
            backgroundColor: 'rgba(232,168,124,0.22)',
          },
        ]}
      >
        <Text style={{ fontSize: 22, marginRight: 12 }}>{item.emoji}</Text>
        <Text style={styles.indText}>{item.title}</Text>
        <View
          style={[
            styles.checkBox,
            selected && { backgroundColor: Colors.saffronGold, borderColor: Colors.templeMaroon },
          ]}
        >
          {selected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </Animated.View>
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
    paddingHorizontal: 16,
  },
  indCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(123,45,63,0.12)',
  },
  indText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(123,45,63,0.3)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: Colors.midnightPlum,
    fontWeight: '800',
    fontSize: 14,
  },
  note: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,245,247,0.85)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.saffronGold,
  },
  noteText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
});
