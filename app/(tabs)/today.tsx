import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { PhaseBackground } from '@/components/ui/PhaseBackground';
import { PhaseRing } from '@/components/PhaseRing';
import { GlassCard } from '@/components/ui/GlassCard';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { Colors, PhaseColors, Typography, Radius } from '@/theme';
import { useStore } from '@/store/useStore';

const { height: H } = Dimensions.get('window');

const QUICK_TILES = [
  { id: 'flow', emoji: '💧', label: 'Flow', key: 'flow' },
  { id: 'mood', emoji: '🌸', label: 'Mood', key: 'mood' },
  { id: 'energy', emoji: '⚡', label: 'Energy', key: 'energy' },
  { id: 'cramps', emoji: '🌊', label: 'Cramps', key: 'cramps' },
  { id: 'bbt', emoji: '🌡️', label: 'BBT · LH', key: 'bbt' },
];

const RECS = [
  { emoji: '🍲', title: 'Eat today', desc: 'Dal, palak, til seeds, turmeric milk' },
  { emoji: '🧘‍♀️', title: 'Move today', desc: '20 min strength flow' },
  { emoji: '💧', title: 'Breathe', desc: '4-7-8 breath, 3 rounds' },
];

export default function Today() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const phase = useStore((s) => s.currentPhase);
  const cycleDay = useStore((s) => s.cycleDay);
  const cycleLength = useStore((s) => s.cycleLength);
  const addLog = useStore((s) => s.addLog);
  const setTutorialSpot = useStore((s) => s.setTutorialSpot);

  const ringRef = useRef<View>(null);
  const saheliCardRef = useRef<View>(null);
  const quickLogRef = useRef<View>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const ringStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.value, [0, 300], [1, 0.62], Extrapolation.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, 300], [0, -30], Extrapolation.CLAMP) },
    ] as any,
  }));

  const p = PhaseColors[phase];

  const handleQuickTap = (key: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    addLog({ [key]: 3 } as any);
  };

  return (
    <View style={{ flex: 1 }}>
      <PhaseBackground phase={phase} />
      <FloatingPetals count={4} colors={[p.secondary, p.primary]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greet}>Good morning,</Text>
            <Text style={styles.greetName}>{user?.name || 'friend'}</Text>
          </View>
          <Pressable
            style={styles.profileBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={{ fontSize: 18 }}>🪷</Text>
          </Pressable>
        </View>

        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View
            ref={ringRef}
            onLayout={() => {
              ringRef.current?.measureInWindow((x, y, w, h) => {
                setTutorialSpot('ring', { cx: x + w / 2, cy: y + h / 2, r: Math.min(w, h) / 2 });
              });
            }}
          >
            <Animated.View style={[styles.ringWrap, ringStyle]}>
              <PhaseRing phase={phase} day={cycleDay} cycleLength={cycleLength} size={280} />
            </Animated.View>
          </View>

          {/* Saheli's narrative */}
          <View
            ref={saheliCardRef}
            onLayout={() => {
              saheliCardRef.current?.measureInWindow((x, y, w, h) => {
                setTutorialSpot('saheliCard', { cx: x + w / 2, cy: y + h / 2, r: w / 2 });
              });
            }}
          >
          <GlassCard style={styles.narrativeCard}>
            <View style={styles.narrativeHeader}>
              <View style={[styles.sahiAvatar, { backgroundColor: p.secondary }]}>
                <Text style={{ fontSize: 18 }}>🪷</Text>
              </View>
              <Text style={styles.sahiLabel}>SAHELI'S NOTE</Text>
            </View>
            <Text style={styles.narrativeText}>
              You are on day {cycleDay} of your cycle — likely in your <Text style={{ fontWeight: '700' }}>{p.name.toLowerCase()}</Text> phase. Your skin has been calmer since day 10. Energy-wise, this is usually your strongest week.
            </Text>
            <Pressable
              style={styles.narrativeCta}
              onPress={() => router.push('/(tabs)/saheli')}
            >
              <Text style={[styles.narrativeCtaText, { color: p.accent }]}>
                Ask Saheli more →
              </Text>
            </Pressable>
          </GlassCard>
          </View>

          {/* Quick log strip */}
          <Text style={styles.sectionLabel}>QUICK LOG</Text>
          <View
            ref={quickLogRef}
            onLayout={() => {
              quickLogRef.current?.measureInWindow((x, y, w, h) => {
                setTutorialSpot('quickLog', { cx: x + w / 2, cy: y + h / 2, r: w / 2 });
              });
            }}
          >
            <View style={styles.quickRow}>
              {QUICK_TILES.map((t) => (
                <Pressable
                  key={t.id}
                  style={styles.quickTile}
                  onPress={() => handleQuickTap(t.key)}
                >
                  <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
                  <Text style={styles.quickLabel}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recommendations */}
          <Text style={styles.sectionLabel}>FOR YOUR {p.name.toUpperCase()} PHASE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {RECS.map((r, i) => (
              <View key={i} style={[styles.recCard, { borderColor: p.secondary }]}>
                <Text style={{ fontSize: 28 }}>{r.emoji}</Text>
                <Text style={[styles.recTitle, { color: p.accent }]}>{r.title}</Text>
                <Text style={styles.recDesc}>{r.desc}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Upcoming */}
          <Text style={styles.sectionLabel}>UPCOMING</Text>
          <View style={styles.upcomingRow}>
            <MiniCard emoji="🩸" label="Next period" value="in ~12 days" />
            <MiniCard emoji="☀️" label="Fertile window" value="days 11-16" />
            <MiniCard emoji="🌡️" label="BBT check" value="tomorrow 7am" />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      <TutorialOverlay />
    </View>
  );
}

function MiniCard({ emoji, label, value }: any) {
  return (
    <View style={styles.miniCard}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greet: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  greetName: {
    fontSize: 26,
    color: Colors.templeMaroon,
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,245,247,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  ringWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  narrativeCard: {
    marginHorizontal: 16,
    padding: 18,
  },
  narrativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sahiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sahiLabel: {
    ...Typography.label,
    color: Colors.templeMaroon,
  },
  narrativeText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  narrativeCta: {
    marginTop: 10,
  },
  narrativeCtaText: {
    fontWeight: '700',
    fontSize: 13,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 8,
  },
  quickTile: {
    flex: 1,
    backgroundColor: 'rgba(255,245,247,0.8)',
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  quickLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  recCard: {
    width: 180,
    padding: 16,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,245,247,0.85)',
    borderWidth: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  recDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  upcomingRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  miniCard: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(255,245,247,0.75)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  miniLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  miniValue: {
    fontSize: 13,
    color: Colors.templeMaroon,
    fontWeight: '700',
    marginTop: 2,
  },
});
