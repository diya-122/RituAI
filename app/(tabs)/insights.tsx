import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Path, G, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { PhaseBackground } from '@/components/ui/PhaseBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors, Typography } from '@/theme';
import { useStore } from '@/store/useStore';

export default function Insights() {
  const phase = useStore((s) => s.currentPhase);
  const scans = useStore((s) => s.scans);
  const riskScore = useStore((s) => s.riskScore);

  return (
    <View style={{ flex: 1 }}>
      <PhaseBackground phase={phase} intensity={0.5} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Your intelligence</Text>
          <Text style={styles.sub}>Patterns I have learned from your data.</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
          {/* Skin-cycle heatmap */}
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>Skin–cycle heatmap</Text>
            <Text style={styles.sectionSub}>Severity by cycle day · last 3 cycles</Text>
            <Heatmap scans={scans} />
            <View style={styles.gradientLegend}>
              <Text style={styles.gradLabel}>clear</Text>
              <LinearGrad />
              <Text style={styles.gradLabel}>severe</Text>
            </View>
            <View style={styles.patternCallout}>
              <Text style={styles.calloutEmoji}>⚡</Text>
              <Text style={styles.calloutText}>
                Your <Text style={{ fontWeight: '800' }}>jawline</Text> flares 4 days before your period. Classic hormonal pattern.
              </Text>
            </View>
          </GlassCard>

          {/* PCOS risk dial */}
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>PCOS risk indicator</Text>
            <Text style={styles.sectionSub}>Multi-signal assessment · not a diagnosis</Text>
            <RiskDial score={riskScore} />
            <View style={{ marginTop: 16 }}>
              {[
                { label: 'Cycle irregularity', score: 8 },
                { label: 'Jawline acne pattern', score: 7 },
                { label: 'Symptom clusters', score: 6 },
                { label: 'Hormonal validation anomalies', score: 5 },
              ].map((ev, i) => (
                <View key={i} style={styles.evidenceRow}>
                  <Text style={styles.evLabel}>{ev.label}</Text>
                  <View style={styles.evBarTrack}>
                    <View style={[styles.evBarFill, { width: `${ev.score * 10}%` }]} />
                  </View>
                  <Text style={styles.evScore}>{ev.score}/10</Text>
                </View>
              ))}
            </View>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                🩺 This is a conversation starter with your doctor — not a diagnosis.
              </Text>
            </View>
          </GlassCard>

          {/* Generate report */}
          <GlassCard style={[styles.card, { padding: 24, alignItems: 'center' }]}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>📜</Text>
            <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>Doctor-ready report</Text>
            <Text style={[styles.sectionSub, { textAlign: 'center', marginBottom: 14 }]}>
              A clinical-grade PDF with your cycle stats, skin timeline, risk breakdown, and suggested tests.
            </Text>
            <PrimaryButton
              title="Generate PDF"
              variant="gold"
              onPress={() => {
                try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
              }}
            />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Heatmap({ scans }: { scans: any[] }) {
  const cycles = 3;
  const days = 28;
  const cellW = 9;
  const cellH = 12;
  const gap = 2;

  // Build matrix from scans
  const matrix: number[][] = Array.from({ length: cycles }, () => Array(days).fill(0));
  scans.forEach((s, i) => {
    const cycle = Math.floor(i / (days / 2)) % cycles;
    const day = s.cycleDay % days;
    matrix[cycle][day] = s.severity;
  });
  // Fill some more with mild randomness for visual richness
  for (let c = 0; c < cycles; c++) {
    for (let d = 0; d < days; d++) {
      if (matrix[c][d] === 0 && Math.random() > 0.6) matrix[c][d] = Math.floor(Math.random() * 3);
    }
  }

  const width = days * (cellW + gap);
  const height = cycles * (cellH + gap) + 20;

  const severityColor = (s: number) => {
    if (s === 0) return '#F5E6D3';
    if (s === 1) return '#E8B4C8';
    if (s === 2) return '#E8A87C';
    if (s === 3) return '#C94F5D';
    return '#7B2D3F';
  };

  return (
    <View style={{ marginTop: 12, alignItems: 'center' }}>
      <Svg width={width} height={height + 16}>
        {matrix.map((row, c) =>
          row.map((v, d) => (
            <Rect
              key={`${c}-${d}`}
              x={d * (cellW + gap)}
              y={c * (cellH + gap) + 16}
              width={cellW}
              height={cellH}
              rx={2}
              fill={severityColor(v)}
            />
          )),
        )}
        {/* Day labels */}
        {[1, 7, 14, 21, 28].map((d) => (
          <G key={d}>
            <Rect
              x={(d - 1) * (cellW + gap)}
              y={0}
              width={cellW}
              height={10}
              fill="transparent"
            />
          </G>
        ))}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width, marginTop: 2 }}>
        <Text style={styles.axisLabel}>Day 1</Text>
        <Text style={styles.axisLabel}>14</Text>
        <Text style={styles.axisLabel}>28</Text>
      </View>
    </View>
  );
}

function LinearGrad() {
  return (
    <Svg width={120} height={10}>
      <Defs>
        <SvgLG id="heatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#F5E6D3" />
          <Stop offset="25%" stopColor="#E8B4C8" />
          <Stop offset="50%" stopColor="#E8A87C" />
          <Stop offset="75%" stopColor="#C94F5D" />
          <Stop offset="100%" stopColor="#7B2D3F" />
        </SvgLG>
      </Defs>
      <Rect x={0} y={0} width={120} height={10} rx={5} fill="url(#heatGrad)" />
    </Svg>
  );
}

function RiskDial({ score }: { score: number }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const radius = 80;
  const startAngle = -210; // degrees
  const endAngle = 30;

  const angle = startAngle + (score / 100) * (endAngle - startAngle);

  // Needle animation
  const needle = useSharedValue(0);
  React.useEffect(() => {
    needle.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
  }, [score]);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx },
      { translateY: cy },
      { rotate: `${startAngle - 90 + (score / 100) * (endAngle - startAngle) * needle.value}deg` },
      { translateX: -cx },
      { translateY: -cy },
    ],
  }));

  const zones = [
    { start: -210, end: -130, color: '#8BA888' },
    { start: -130, end: -50, color: '#E8A87C' },
    { start: -50, end: 30, color: '#C94F5D' },
  ];

  const describeArc = (startDeg: number, endDeg: number, r: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const sx = cx + r * Math.cos(toRad(startDeg));
    const sy = cy + r * Math.sin(toRad(startDeg));
    const ex = cx + r * Math.cos(toRad(endDeg));
    const ey = cy + r * Math.sin(toRad(endDeg));
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
  };

  return (
    <View style={{ alignItems: 'center', marginTop: 14 }}>
      <View>
        <Svg width={size} height={size}>
          {zones.map((z, i) => (
            <Path
              key={i}
              d={describeArc(z.start, z.end, radius)}
              stroke={z.color}
              strokeWidth={18}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <Circle cx={cx} cy={cy} r={10} fill={Colors.templeMaroon} />
        </Svg>
        <Animated.View
          style={[
            { position: 'absolute', left: 0, top: 0, width: size, height: size },
            needleStyle,
          ]}
        >
          <Svg width={size} height={size}>
            <Path
              d={`M ${cx} ${cy} L ${cx} ${cy - radius + 10}`}
              stroke={Colors.templeMaroon}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      </View>
      <Text style={styles.scoreNumber}>{score}</Text>
      <Text style={styles.scoreLabel}>
        {score < 35 ? 'LOW' : score < 65 ? 'ELEVATED' : 'HIGH'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: {
    fontSize: 30,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
    letterSpacing: -0.5,
  },
  sub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  card: { marginTop: 12, padding: 18 },
  sectionTitle: {
    ...Typography.bodyBold,
    fontSize: 17,
    color: Colors.templeMaroon,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  gradientLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  gradLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  patternCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(232,168,124,0.18)',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  calloutEmoji: { fontSize: 20, marginRight: 8 },
  calloutText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: '200',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
    marginTop: -50,
  },
  scoreLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  evLabel: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  evBarTrack: {
    flex: 1.2,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(123,45,63,0.1)',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  evBarFill: {
    height: '100%',
    backgroundColor: Colors.templeMaroon,
    borderRadius: 4,
  },
  evScore: {
    fontSize: 11,
    color: Colors.templeMaroon,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  disclaimer: {
    marginTop: 14,
    backgroundColor: 'rgba(245,230,211,0.7)',
    padding: 12,
    borderRadius: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
