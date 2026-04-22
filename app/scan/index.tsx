import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Ellipse, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Gradients, Typography, Radius, Shadows } from '@/theme';
import { useStore } from '@/store/useStore';

const { width: W, height: H } = Dimensions.get('window');

type Phase = 'prepare' | 'camera' | 'processing' | 'results';

export default function Scan() {
  const router = useRouter();
  const cycleDay = useStore((s) => s.cycleDay);
  const addScan = useStore((s) => s.addScan);
  const [phase, setPhase] = useState<Phase>('prepare');
  const [prepStep, setPrepStep] = useState(0);

  useEffect(() => {
    if (phase === 'prepare') {
      const t = setInterval(() => {
        setPrepStep((p) => (p + 1) % 3);
      }, 3000);
      return () => clearInterval(t);
    }
  }, [phase]);

  const onCapture = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    setPhase('processing');
    setTimeout(() => {
      const newScan = {
        id: `scan-${Date.now()}`,
        date: new Date().toISOString(),
        cycleDay,
        zones: {
          forehead: 1,
          leftCheek: 1,
          rightCheek: 0,
          chin: 3,
          jawline: 3,
        },
        severity: 3,
        lesionTypes: { papules: 3, pustules: 1, comedones: 2, cysts: 1 },
        interpretation: 'Jawline-concentrated pattern, consistent with hormonal acne.',
      };
      addScan(newScan);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setPhase('results');
    }, 5000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.midnightPlum }}>
      <LinearGradient
        colors={Gradients.heroNight as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Close button */}
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>

        {phase === 'prepare' && <PreparePhase step={prepStep} onReady={() => setPhase('camera')} />}
        {phase === 'camera' && <CameraPhase onCapture={onCapture} cycleDay={cycleDay} />}
        {phase === 'processing' && <ProcessingPhase />}
        {phase === 'results' && (
          <ResultsPhase
            cycleDay={cycleDay}
            onDone={() => router.back()}
            onRescan={() => {
              setPhase('prepare');
              setPrepStep(0);
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function PreparePhase({ step, onReady }: { step: number; onReady: () => void }) {
  const STEPS = [
    { emoji: '☀️', title: 'Find soft, natural light', body: 'Window light, 20 minutes after sunrise or before sunset, is ideal.' },
    { emoji: '💫', title: 'Tie your hair back', body: 'Keep your forehead, jawline, and cheeks visible.' },
    { emoji: '🌬️', title: 'Breathe', body: 'Take three slow breaths. This is just you, your phone, and your body.' },
  ];

  return (
    <View style={styles.centerContent}>
      <FloatingPetals count={8} colors={['#E8A87C', '#FFD89B', '#E8B4C8']} />

      <Text style={styles.prepLabel}>BEFORE WE BEGIN</Text>
      <View style={styles.prepCard}>
        <Text style={styles.prepEmoji}>{STEPS[step].emoji}</Text>
        <Text style={styles.prepTitle}>{STEPS[step].title}</Text>
        <Text style={styles.prepBody}>{STEPS[step].body}</Text>
      </View>
      <View style={styles.prepDots}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.prepDot,
              {
                width: i === step ? 22 : 6,
                backgroundColor: i === step ? Colors.saffronGold : 'rgba(255,255,255,0.3)',
              },
            ]}
          />
        ))}
      </View>
      <View style={{ width: '100%', paddingHorizontal: 32, marginTop: 40 }}>
        <PrimaryButton title="I'm Ready" variant="gold" onPress={onReady} />
      </View>
    </View>
  );
}

function CameraPhase({ onCapture, cycleDay }: { onCapture: () => void; cycleDay: number }) {
  const [countdown, setCountdown] = useState<number | null>(null);

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, []);

  const startCountdown = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setCountdown(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n > 0) {
        try { Haptics.selectionAsync(); } catch {}
        setCountdown(n);
      } else {
        clearInterval(iv);
        setCountdown(null);
        onCapture();
      }
    }, 900);
  };

  const ovalStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.5, 0.95]),
  }));

  return (
    <View style={styles.centerContent}>
      {/* Cycle day badge */}
      <View style={styles.cycleBadge}>
        <Text style={styles.cycleBadgeText}>Day {cycleDay} · auto-tagged</Text>
      </View>

      {/* Face guide */}
      <View style={styles.cameraWrap}>
        {/* Faux camera background */}
        <LinearGradient
          colors={['rgba(232,180,200,0.2)', 'rgba(201,184,232,0.2)'] as unknown as readonly [string, string]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, ovalStyle, { alignItems: 'center', justifyContent: 'center' }]}>
          <Svg width={260} height={340} viewBox="0 0 260 340">
            <Defs>
              <RadialGradient id="faceGuide" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#E8A87C" stopOpacity={0.15} />
                <Stop offset="100%" stopColor="#E8A87C" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={130} cy={170} rx={110} ry={155} fill="url(#faceGuide)" />
            <Ellipse
              cx={130}
              cy={170}
              rx={110}
              ry={155}
              stroke={Colors.saffronGold}
              strokeWidth={2}
              fill="none"
              strokeDasharray="5,8"
            />
            {/* Zone anchor dots */}
            {[
              [130, 80],
              [90, 160],
              [170, 160],
              [130, 250],
              [100, 275],
              [160, 275],
            ].map(([x, y], i) => (
              <G key={i}>
                <Circle cx={x} cy={y} r={6} fill={Colors.saffronGold} opacity={0.3} />
                <Circle cx={x} cy={y} r={3} fill={Colors.saffronGold} />
              </G>
            ))}
          </Svg>
        </Animated.View>

        {countdown !== null && (
          <View style={styles.countdown}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      <Text style={styles.cameraHint}>Center your face in the oval</Text>

      <Pressable onPress={startCountdown} style={styles.shutterWrap}>
        <View style={styles.shutterOuter}>
          <View style={styles.shutterInner} />
        </View>
      </Pressable>
    </View>
  );
}

function ProcessingPhase() {
  const sweep = useSharedValue(0);
  const messages = [
    'Analyzing T-zone...',
    'Checking jawline...',
    'Mapping acne zones...',
    'Cross-referencing with cycle day...',
    'Comparing to previous scans...',
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);
    const iv = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, messages.length - 1));
    }, 900);
    return () => clearInterval(iv);
  }, []);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(sweep.value, [0, 1], [-200, 200]) }],
  }));

  return (
    <View style={styles.centerContent}>
      <View style={styles.procWrap}>
        <LinearGradient
          colors={['rgba(232,180,200,0.3)', 'rgba(45,27,46,0.8)'] as unknown as readonly [string, string]}
          style={StyleSheet.absoluteFill}
        />
        {/* Sweeping scan line */}
        <Animated.View style={[styles.sweepLine, sweepStyle]}>
          <LinearGradient
            colors={['transparent', Colors.saffronGold, 'transparent'] as unknown as readonly [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3, width: '100%' }}
          />
        </Animated.View>

        {/* Zone dots lighting up */}
        <Svg width={240} height={320} viewBox="0 0 240 320" style={StyleSheet.absoluteFill}>
          {[
            [120, 70],
            [80, 150],
            [160, 150],
            [120, 230],
            [90, 260],
            [150, 260],
          ].map(([x, y], i) => (
            <AnimatedZoneDot key={i} x={x as number} y={y as number} delay={i * 400} />
          ))}
        </Svg>
      </View>

      <Text style={styles.procTitle}>{messages[msgIndex]}</Text>
      <Text style={styles.procSub}>Claude Vision is analyzing your skin</Text>
    </View>
  );
}

function AnimatedZoneDot({ x, y }: { x: number; y: number; delay: number }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={10} fill="#E8A87C" opacity={0.35} />
      <Circle cx={x} cy={y} r={4} fill="#E8A87C" />
    </G>
  );
}

function ResultsPhase({
  cycleDay,
  onDone,
  onRescan,
}: {
  cycleDay: number;
  onDone: () => void;
  onRescan: () => void;
}) {
  const ZONES = [
    { name: 'Forehead', count: 1, severity: 'mild' },
    { name: 'L Cheek', count: 1, severity: 'mild' },
    { name: 'R Cheek', count: 0, severity: 'clear' },
    { name: 'Chin', count: 3, severity: 'moderate' },
    { name: 'Jawline', count: 3, severity: 'moderate' },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={styles.resultsTitle}>Your scan · Day {cycleDay}</Text>

        {/* Face with zone overlay */}
        <View style={styles.faceResult}>
          <Svg width={260} height={320} viewBox="0 0 260 320">
            <Ellipse cx={130} cy={170} rx={110} ry={150} fill="rgba(232,180,200,0.25)" stroke={Colors.auroraRose} strokeWidth={1.5} />
            {/* Eyes */}
            <Circle cx={100} cy={145} r={3} fill={Colors.lotusMist} />
            <Circle cx={160} cy={145} r={3} fill={Colors.lotusMist} />
            {/* Mouth hint */}
            <Path d="M 115 210 Q 130 216, 145 210" stroke={Colors.lotusMist} strokeWidth={1.5} fill="none" />
            {/* Acne zone markers */}
            {[
              [130, 90, 1, 'Forehead'],
              [95, 150, 1, 'L Cheek'],
              [130, 240, 3, 'Chin'],
              [100, 265, 2, 'Jaw L'],
              [160, 265, 2, 'Jaw R'],
            ].map(([x, y, count], i) => (
              <G key={i}>
                <Circle
                  cx={x as number}
                  cy={y as number}
                  r={(count as number) * 4 + 4}
                  fill={Colors.saffronGold}
                  opacity={0.2}
                />
                <Circle
                  cx={x as number}
                  cy={y as number}
                  r={4}
                  fill={Colors.saffronGold}
                />
              </G>
            ))}
          </Svg>
        </View>

        <GlassCard style={{ marginTop: 16 }}>
          <Text style={styles.rTitle}>Severity · moderate</Text>
          <View style={styles.sevBar}>
            <View style={[styles.sevFill, { width: '60%' }]} />
          </View>

          <View style={{ marginTop: 16 }}>
            {ZONES.map((z) => (
              <View key={z.name} style={styles.zoneRow}>
                <Text style={styles.zoneName}>{z.name}</Text>
                <View style={styles.zoneDots}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.zoneDot,
                        i < z.count && { backgroundColor: Colors.saffronGold },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.zoneSeverity}>{z.severity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.interpretation}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>🪷</Text>
            <Text style={styles.interpText}>
              <Text style={{ fontWeight: '700' }}>Saheli: </Text>
              Jawline-concentrated pattern, consistent with hormonal acne. This is useful evidence — saved to your cycle day {cycleDay} memory.
            </Text>
          </View>
        </GlassCard>

        <View style={{ marginTop: 16, gap: 10 }}>
          <PrimaryButton title="Save and finish" onPress={onDone} variant="primary" />
          <PrimaryButton title="Scan again" onPress={onRescan} variant="ghost" />
        </View>

        <Text style={styles.privacyChip}>🔒 Image stored encrypted. Delete anytime.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  closeIcon: { color: Colors.lotusMist, fontSize: 18, fontWeight: '600' },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  prepLabel: {
    ...Typography.label,
    color: Colors.auroraRose,
    marginBottom: 30,
  },
  prepCard: {
    paddingHorizontal: 40,
    alignItems: 'center',
    minHeight: 160,
  },
  prepEmoji: { fontSize: 56, marginBottom: 18 },
  prepTitle: {
    fontSize: 24,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.lotusMist,
    textAlign: 'center',
  },
  prepBody: {
    fontSize: 14,
    color: Colors.auroraRose,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  prepDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 30,
  },
  prepDot: {
    height: 6,
    borderRadius: 3,
  },
  cycleBadge: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(232,168,124,0.25)',
    borderWidth: 1,
    borderColor: Colors.saffronGold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  cycleBadgeText: {
    color: Colors.saffronGold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cameraWrap: {
    width: W * 0.85,
    height: W * 1.1,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginTop: 40,
  },
  cameraHint: {
    marginTop: 16,
    color: Colors.auroraRose,
    fontSize: 13,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
  countdown: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,27,46,0.6)',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  countdownText: {
    fontSize: 72,
    color: Colors.saffronGold,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  shutterWrap: {
    marginTop: 30,
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: Colors.lotusMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.saffronGold,
  },
  procWrap: {
    width: W * 0.7,
    height: W * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  sweepLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  procTitle: {
    color: Colors.saffronGold,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  procSub: {
    color: Colors.auroraRose,
    fontSize: 13,
    marginTop: 6,
    fontStyle: 'italic',
  },
  resultsTitle: {
    fontSize: 28,
    color: Colors.lotusMist,
    fontWeight: '300',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  faceResult: {
    alignItems: 'center',
    marginTop: 16,
  },
  rTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.templeMaroon,
  },
  sevBar: {
    height: 6,
    backgroundColor: 'rgba(123,45,63,0.15)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  sevFill: {
    height: '100%',
    backgroundColor: Colors.saffronGold,
    borderRadius: 3,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  zoneName: {
    width: 80,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  zoneDots: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  zoneDot: {
    width: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(123,45,63,0.12)',
  },
  zoneSeverity: {
    width: 70,
    textAlign: 'right',
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  interpretation: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: 'rgba(255,245,247,0.8)',
    padding: 14,
    borderRadius: 14,
  },
  interpText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  privacyChip: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 11,
    color: Colors.auroraRose,
    opacity: 0.7,
  },
});
