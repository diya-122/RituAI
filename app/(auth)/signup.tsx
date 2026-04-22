import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSpring, withRepeat, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Doorway } from '@/components/illustrations/Doorway';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Typography, Gradients, Radius } from '@/theme';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

const { height: H } = Dimensions.get('window');

export default function Signup() {
  const router = useRouter();
  const signup = useStore((s) => s.signup);
  const [step, setStep] = useState<'closed' | 'opening' | 'name' | 'email'>('closed');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const headerOp = useSharedValue(1);
  const formOp = useSharedValue(0);
  const formY = useSharedValue(40);
  const doorScale = useSharedValue(1);
  const hintOp = useSharedValue(0);

  useEffect(() => {
    hintOp.value = withDelay(1200, withRepeat(withTiming(1, { duration: 1400 }), -1, true));
  }, []);

  const openDoor = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setStep('opening');
    doorScale.value = withSpring(0.85, { damping: 14 });
    headerOp.value = withTiming(0.5, { duration: 600 });
    hintOp.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setStep('name');
      formOp.value = withTiming(1, { duration: 600 });
      formY.value = withSpring(0, { damping: 14, stiffness: 120 });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }, 900);
  };

  const continueStep = () => {
    try { Haptics.selectionAsync(); } catch {}
    if (step === 'name' && name.trim().length > 1) setStep('email');
    else if (step === 'email' && email.includes('@')) handleComplete();
  };

  const handleComplete = async () => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    await api.createUser(email, name);
    signup({ name, email });
    setTimeout(() => router.replace('/(onboarding)/chapter1'), 300);
  };

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));
  const doorWrapStyle = useAnimatedStyle(() => ({ transform: [{ scale: doorScale.value }] }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOp.value,
    transform: [{ translateY: formY.value }],
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hintOp.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(hintOp.value, [0, 1], [0, -4]) }],
  }));

  const canContinue =
    (step === 'name' && name.trim().length > 1) ||
    (step === 'email' && email.includes('@'));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Gradients.heroNight as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={6} colors={['#FFD89B', '#E8A87C', '#E8B4C8']} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.headerWrap, headerStyle]}>
              <Text style={styles.kicker}>CROSS THE THRESHOLD</Text>
              <Text style={styles.heading}>Step into your ritual</Text>
              <Text style={styles.sub}>A space that listens before it speaks.</Text>
            </Animated.View>

            <Pressable onPress={step === 'closed' ? openDoor : undefined}>
              <Animated.View style={[styles.doorWrap, doorWrapStyle]}>
                <Doorway size={260} open={step !== 'closed'} />
              </Animated.View>
            </Pressable>

            {step === 'closed' && (
              <Animated.View style={[{ alignItems: 'center', marginTop: 8 }, hintStyle]}>
                <Text style={styles.hintText}>Tap the door to enter</Text>
              </Animated.View>
            )}

            {(step === 'name' || step === 'email') && (
              <Animated.View style={[styles.formWrap, formStyle]}>
                {step === 'name' && (
                  <View>
                    <Text style={styles.question}>What should Saheli call you?</Text>
                    <TextInput
                      value={name} onChangeText={setName}
                      placeholder="Your name"
                      placeholderTextColor="rgba(255,245,247,0.4)"
                      style={styles.input} autoFocus
                      onSubmitEditing={continueStep} returnKeyType="next"
                    />
                  </View>
                )}
                {step === 'email' && (
                  <View>
                    <Text style={styles.question}>And where should I reach you?</Text>
                    <TextInput
                      value={email} onChangeText={setEmail}
                      placeholder="Your email"
                      placeholderTextColor="rgba(255,245,247,0.4)"
                      style={styles.input} autoFocus
                      keyboardType="email-address" autoCapitalize="none"
                      onSubmitEditing={continueStep} returnKeyType="done"
                    />
                  </View>
                )}
                <View style={{ height: 20 }} />
                <PrimaryButton
                  title={step === 'email' ? 'Enter' : 'Continue'}
                  variant="gold" onPress={continueStep} disabled={!canContinue}
                />
                <View style={styles.stepDots}>
                  <View style={[styles.stepDot, step === 'name' && styles.stepDotActive]} />
                  <View style={[styles.stepDot, step === 'email' && styles.stepDotActive]} />
                </View>
              </Animated.View>
            )}

            <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28 }}>
              <Text style={styles.linkText}>
                Already have an account?  <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Log in</Text>
              </Text>
            </Pressable>

            <View style={styles.covenant}>
              <Text style={styles.covenantText}>🔒  Your data stays yours. No ads. No data selling. Ever.</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingVertical: 20, alignItems: 'center', minHeight: H - 80 },
  headerWrap: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  kicker: { ...Typography.label, color: Colors.saffronGold, marginBottom: 8 },
  heading: { ...Typography.h1, color: Colors.lotusMist, textAlign: 'center', fontStyle: 'italic', fontWeight: '300' },
  sub: { ...Typography.body, color: Colors.auroraRose, textAlign: 'center', marginTop: 6, opacity: 0.85 },
  doorWrap: { alignItems: 'center', marginVertical: 16 },
  hintText: { color: Colors.saffronGold, fontSize: 15, fontStyle: 'italic', letterSpacing: 0.5 },
  formWrap: { width: '100%', maxWidth: 420, marginTop: 24 },
  question: { fontSize: 24, fontStyle: 'italic', fontWeight: '300', color: Colors.lotusMist, textAlign: 'center', marginBottom: 18 },
  input: {
    backgroundColor: 'rgba(255,245,247,0.1)', borderWidth: 1,
    borderColor: 'rgba(232,168,124,0.4)', borderRadius: Radius.pill,
    paddingHorizontal: 22, paddingVertical: 18, fontSize: 17,
    color: Colors.lotusMist, textAlign: 'center',
  },
  stepDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 18 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,245,247,0.3)' },
  stepDotActive: { width: 20, backgroundColor: Colors.saffronGold },
  linkText: { color: Colors.auroraRose, fontSize: 14, textAlign: 'center' },
  covenant: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  covenantText: { fontSize: 11, color: Colors.auroraRose, opacity: 0.8, textAlign: 'center' },
});
