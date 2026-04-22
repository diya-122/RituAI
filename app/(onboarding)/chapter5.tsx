import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { OnboardingHeader } from '@/components/ui/OnboardingHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { ConsentScroll } from '@/components/illustrations/Scenes';
import { LotusMandala } from '@/components/illustrations/LotusMandala';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Gradients, Typography, Radius } from '@/theme';
import { useStore } from '@/store/useStore';

export default function Chapter5() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [consent, setConsent] = React.useState(false);
  const [dailyReminder, setDailyReminder] = React.useState(true);
  const [complete, setComplete] = React.useState(false);

  const scrollOp = useSharedValue(0);
  const scrollScale = useSharedValue(0.8);
  const completeOp = useSharedValue(0);

  useEffect(() => {
    scrollOp.value = withTiming(1, { duration: 700 });
    scrollScale.value = withSpring(1, { damping: 14, stiffness: 90 });
  }, []);

  const scrollStyle = useAnimatedStyle(() => ({
    opacity: scrollOp.value,
    transform: [{ scale: scrollScale.value }],
  }));

  const handleComplete = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    completeOnboarding({
      lifestyle: { stress: 5, sleep: 7, activity: 'light', diet: ['Vegetarian'] },
      pcos: {
        jawlineAcne: false,
        hairGrowth: false,
        hairThinning: false,
        weightChanges: false,
        missedCycles: false,
        moodSwings: false,
        darkPatches: false,
      },
    });
    setComplete(true);
    completeOp.value = withTiming(1, { duration: 600 });
    setTimeout(() => {
      router.replace('/(tabs)/today');
    }, 2500);
  };

  const completeStyle = useAnimatedStyle(() => ({
    opacity: completeOp.value,
  }));

  if (complete) {
    return (
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={Gradients.saffronDawn as unknown as readonly [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <FloatingPetals count={20} colors={['#E8A87C', '#FFD89B', '#E8B4C8']} />
        <Animated.View
          style={[
            { flex: 1, alignItems: 'center', justifyContent: 'center' },
            completeStyle,
          ]}
        >
          <LotusMandala size={240} />
          <Text style={styles.completeTitle}>Your ritual is ready.</Text>
          <Text style={styles.completeSub}>
            I am so glad you are here. Let me show you around.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.saffronDawn as unknown as readonly [string, string, string]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={6} colors={['#E8A87C', '#FFD89B']} />
      <OnboardingHeader step={5} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.illWrap, scrollStyle]}>
          <ConsentScroll size={220} />
        </Animated.View>

        <Text style={styles.title}>Your first ritual</Text>
        <Text style={styles.sub}>A few gentle agreements before we begin.</Text>

        <GlassCard style={{ marginTop: 20 }}>
          <Row
            label="I consent to anonymous data processing for my own insights"
            value={consent}
            onChange={setConsent}
          />
          <View style={styles.divider} />
          <Row
            label="Send me a gentle daily check-in reminder"
            value={dailyReminder}
            onChange={setDailyReminder}
          />
        </GlassCard>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            🔒 <Text style={{ fontWeight: '700' }}>Your covenant:</Text> Your data is yours. Stored encrypted. Never sold. Delete anytime.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Enter RituAI"
          variant="gold"
          onPress={handleComplete}
          disabled={!consent}
        />
      </View>
    </View>
  );
}

function Row({ label, value, onChange }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => {
          try { Haptics.selectionAsync(); } catch {}
          onChange(v);
        }}
        trackColor={{ false: 'rgba(123,45,63,0.2)', true: Colors.saffronGold }}
        thumbColor={value ? Colors.templeMaroon : '#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },
  illWrap: { alignItems: 'center', marginTop: 10, marginBottom: 6 },
  title: {
    fontSize: 28,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingRight: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(123,45,63,0.1)',
    marginVertical: 4,
  },
  note: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,245,247,0.85)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.templeMaroon,
  },
  noteText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  completeTitle: {
    fontSize: 36,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
    marginTop: 28,
  },
  completeSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 10,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
});
