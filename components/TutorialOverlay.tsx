import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme';
import { useStore } from '@/store/useStore';

const { width: W, height: H } = Dimensions.get('window');

type Spot = { cx: number; cy: number; r: number };

type Step = {
  title: string;
  body: string;
  spotlight: Spot;
  bubblePosition: 'top' | 'bottom';
};

function buildSteps(spots: {
  ring: Spot | null;
  saheliCard: Spot | null;
  quickLog: Spot | null;
  fab: Spot | null;
}): Step[] {
  return [
    {
      title: 'This is your phase ring',
      body: 'It tells you exactly where you are in your cycle. The color shifts as your body shifts.',
      spotlight: spots.ring ?? { cx: W / 2, cy: H * 0.28, r: 148 },
      bubblePosition: 'bottom',
    },
    {
      title: 'Log your day in seconds',
      body: 'One tap on each tile. Flow, mood, energy, cramps — takes less than 30 seconds.',
      spotlight: spots.quickLog ?? { cx: W / 2, cy: H * 0.60, r: 80 },
      bubblePosition: 'top',
    },
    {
      title: "Saheli's daily note",
      body: 'Personalized insight every morning, written in plain language — not medical jargon.',
      spotlight: spots.saheliCard ?? { cx: W / 2, cy: H * 0.46, r: W / 2 - 8 },
      bubblePosition: 'bottom',
    },
    {
      title: 'Tap the gold circle to scan',
      body: 'Your camera becomes hormonal intelligence. Every selfie is auto-linked to your cycle day.',
      spotlight: spots.fab ?? { cx: W / 2, cy: H - 52, r: 42 },
      bubblePosition: 'top',
    },
    {
      title: 'You are ready.',
      body: 'Whenever you feel lost, tap the 💬 tab and I am here. This is your space now.',
      spotlight: { cx: W / 2, cy: H / 2, r: 200 },
      bubblePosition: 'bottom',
    },
  ];
}

export function TutorialOverlay() {
  const hasSeenTutorial = useStore((s) => s.hasSeenTutorial);
  const markTutorialSeen = useStore((s) => s.markTutorialSeen);
  const tutorialSpots = useStore((s) => s.tutorialSpots);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hasSeenTutorial) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [hasSeenTutorial]);

  if (!visible) return null;

  const steps = buildSteps(tutorialSpots);
  const s = steps[step];

  const advance = () => {
    try { Haptics.selectionAsync(); } catch {}
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      markTutorialSeen();
      setVisible(false);
    }
  };

  const skip = () => {
    markTutorialSeen();
    setVisible(false);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  // Position bubble so it doesn't overlap the spotlight and stays on screen
  const BUBBLE_HEIGHT = 230;
  const GAP = 20;
  let bubbleTop: number;
  if (s.bubblePosition === 'top') {
    bubbleTop = Math.max(48, s.spotlight.cy - s.spotlight.r - GAP - BUBBLE_HEIGHT);
  } else {
    bubbleTop = Math.min(H - BUBBLE_HEIGHT - 20, s.spotlight.cy + s.spotlight.r + GAP);
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={advance}>
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id="spotlight">
              <Rect x={0} y={0} width={W} height={H} fill="white" />
              <Circle cx={s.spotlight.cx} cy={s.spotlight.cy} r={s.spotlight.r} fill="black" />
            </Mask>
          </Defs>
          <Rect
            x={0} y={0} width={W} height={H}
            fill={Colors.midnightPlum}
            opacity={0.82}
            mask="url(#spotlight)"
          />
          <Circle
            cx={s.spotlight.cx} cy={s.spotlight.cy} r={s.spotlight.r + 5}
            stroke={Colors.saffronGold} strokeWidth={2} fill="none" opacity={0.85}
          />
          <Circle
            cx={s.spotlight.cx} cy={s.spotlight.cy} r={s.spotlight.r + 13}
            stroke={Colors.saffronGold} strokeWidth={1} fill="none" opacity={0.35}
          />
        </Svg>
      </Pressable>

      <View style={[styles.bubble, { top: bubbleTop }]}>
        <View style={styles.sahiHeader}>
          <View style={styles.sahiAvatar}>
            <Text style={{ fontSize: 22 }}>🪷</Text>
          </View>
          <Text style={styles.sahiName}>Saheli</Text>
        </View>
        <Text style={styles.bubbleTitle}>{s.title}</Text>
        <Text style={styles.bubbleBody}>{s.body}</Text>

        <View style={styles.progress}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  width: i === step ? 22 : 6,
                  backgroundColor:
                    i === step ? Colors.saffronGold : 'rgba(255,255,255,0.35)',
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {step > 0 && (
            <Pressable onPress={back} hitSlop={10}>
              <Text style={styles.backLink}>Back</Text>
            </Pressable>
          )}
          <Pressable onPress={skip} hitSlop={10} style={{ marginLeft: step > 0 ? 16 : 0 }}>
            <Text style={styles.skipLink}>Skip tour</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={advance} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>
              {step === steps.length - 1 ? 'Begin' : 'Next →'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(45,27,46,0.97)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.saffronGold,
    shadowColor: Colors.saffronGold,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  sahiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sahiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.auroraRose,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sahiName: {
    color: Colors.saffronGold,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  bubbleTitle: {
    color: Colors.lotusMist,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  bubbleBody: {
    color: Colors.auroraRose,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  progress: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLink: { color: Colors.auroraRose, fontSize: 13, fontWeight: '600' },
  skipLink: { color: Colors.textMuted, fontSize: 13 },
  nextBtn: {
    backgroundColor: Colors.saffronGold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  nextBtnText: {
    color: Colors.midnightPlum,
    fontWeight: '800',
    fontSize: 13,
  },
});
