import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSpring, withRepeat, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Line } from 'react-native-svg';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Doorway } from '@/components/illustrations/Doorway';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, Typography, Gradients, Radius } from '@/theme';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';

const { height: H } = Dimensions.get('window');

function EyeIcon({ visible }: { visible: boolean }) {
  const c = 'rgba(255,245,247,0.55)';
  if (visible) {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth={1.6} fill="none" />
        <Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={1.6} fill="none" />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round"
      />
      <Line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (password.length >= 12 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0);
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  const color =
    score <= 1 ? Colors.danger :
    score === 2 ? Colors.saffronGold :
    score === 3 ? Colors.auroraRose :
    Colors.emeraldBreath;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              backgroundColor: i < score ? color : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </View>
      <Text style={{ color, fontSize: 11, marginTop: 4, textAlign: 'right', fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

type Step = 'closed' | 'opening' | 'name' | 'email' | 'password';

export default function Signup() {
  const router = useRouter();
  const signup = useStore((s) => s.signup);
  const [step, setStep] = useState<Step>('closed');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

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

  const animateTransition = (next: Step) => {
    formOp.value = withTiming(0, { duration: 180 }, () => {
      formOp.value = withTiming(1, { duration: 300 });
    });
    formY.value = withTiming(16, { duration: 180 }, () => {
      formY.value = withSpring(0, { damping: 14 });
    });
    setTimeout(() => {
      setStep(next);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 180);
  };

  const continueStep = () => {
    try { Haptics.selectionAsync(); } catch {}
    if (step === 'name') {
      if (name.trim().length < 2) { setError('Please enter your name.'); return; }
      animateTransition('email');
    } else if (step === 'email') {
      if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address.');
        return;
      }
      animateTransition('password');
    } else if (step === 'password') {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      await api.createUser(email, name);
      signup({ name, email });
      setTimeout(() => router.replace('/(onboarding)/chapter1'), 300);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
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

  const stepIndex = step === 'name' ? 0 : step === 'email' ? 1 : step === 'password' ? 2 : -1;
  const isFormStep = stepIndex >= 0;

  const canContinue =
    (step === 'name' && name.trim().length >= 2) ||
    (step === 'email' && email.includes('@') && email.includes('.')) ||
    (step === 'password' && password.length >= 6);

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

            {isFormStep && (
              <Animated.View style={[styles.formWrap, formStyle]}>
                {step === 'name' && (
                  <>
                    <Text style={styles.question}>What should Saheli call you?</Text>
                    <TextInput
                      ref={inputRef}
                      value={name}
                      onChangeText={(v) => { setName(v); if (error) setError(''); }}
                      placeholder="Your name"
                      placeholderTextColor="rgba(255,245,247,0.4)"
                      style={[styles.input, !!error && styles.inputError]}
                      autoFocus
                      onSubmitEditing={continueStep}
                      returnKeyType="next"
                    />
                  </>
                )}

                {step === 'email' && (
                  <>
                    <Text style={styles.question}>And where should I reach you?</Text>
                    <TextInput
                      ref={inputRef}
                      value={email}
                      onChangeText={(v) => { setEmail(v); if (error) setError(''); }}
                      placeholder="Your email"
                      placeholderTextColor="rgba(255,245,247,0.4)"
                      style={[styles.input, !!error && styles.inputError]}
                      autoFocus
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onSubmitEditing={continueStep}
                      returnKeyType="next"
                      textContentType="emailAddress"
                    />
                  </>
                )}

                {step === 'password' && (
                  <>
                    <Text style={styles.question}>Set your password</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        ref={inputRef}
                        value={password}
                        onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
                        placeholder="Min. 6 characters"
                        placeholderTextColor="rgba(255,245,247,0.4)"
                        style={[styles.input, styles.inputWithIcon, !!error && styles.inputError]}
                        autoFocus
                        secureTextEntry={!showPass}
                        onSubmitEditing={continueStep}
                        returnKeyType="done"
                        textContentType="newPassword"
                      />
                      <Pressable
                        onPress={() => setShowPass((v) => !v)}
                        style={styles.eyeBtn}
                        hitSlop={12}
                      >
                        <EyeIcon visible={showPass} />
                      </Pressable>
                    </View>
                    <PasswordStrength password={password} />
                  </>
                )}

                {!!error && (
                  <View style={styles.errorWrap}>
                    <Text style={styles.errorText}>⚠  {error}</Text>
                  </View>
                )}

                <View style={{ height: 20 }} />

                {loading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={Colors.saffronGold} />
                    <Text style={styles.loadingText}>Creating your space…</Text>
                  </View>
                ) : (
                  <PrimaryButton
                    title={step === 'password' ? 'Enter' : 'Continue'}
                    variant="gold"
                    onPress={continueStep}
                    disabled={!canContinue}
                  />
                )}

                {/* 3-step progress dots */}
                <View style={styles.stepDots}>
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.stepDot,
                        i === stepIndex && styles.stepDotActive,
                        i < stepIndex && styles.stepDotDone,
                      ]}
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 28 }}>
              <Text style={styles.linkText}>
                Already have an account?{'  '}
                <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Log in</Text>
              </Text>
            </Pressable>

            <View style={styles.covenant}>
              <Text style={styles.covenantText}>
                🔒  Your data stays yours. No ads. No data selling. Ever.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingVertical: 20, alignItems: 'center', minHeight: H - 80 },
  headerWrap: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  kicker: { ...Typography.label, color: Colors.saffronGold, marginBottom: 8 },
  heading: {
    ...Typography.h1,
    color: Colors.lotusMist,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  sub: { ...Typography.body, color: Colors.auroraRose, textAlign: 'center', marginTop: 6, opacity: 0.85 },
  doorWrap: { alignItems: 'center', marginVertical: 16 },
  hintText: { color: Colors.saffronGold, fontSize: 15, fontStyle: 'italic', letterSpacing: 0.5 },
  formWrap: { width: '100%', maxWidth: 420, marginTop: 24 },
  inputRow: { position: 'relative', width: '100%' },
  question: {
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '300',
    color: Colors.lotusMist,
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    backgroundColor: 'rgba(255,245,247,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(232,168,124,0.35)',
    borderRadius: Radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 18,
    fontSize: 17,
    color: Colors.lotusMist,
    textAlign: 'center',
  },
  inputWithIcon: { paddingRight: 52 },
  inputError: { borderColor: 'rgba(201,79,93,0.75)' },
  eyeBtn: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 38,
  },
  errorWrap: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(201,79,93,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,79,93,0.35)',
  },
  errorText: { color: '#f9b3bb', fontSize: 13, textAlign: 'center', fontWeight: '500' },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(232,168,124,0.12)',
  },
  loadingText: { color: Colors.saffronGold, fontSize: 16, fontStyle: 'italic' },
  stepDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 18 },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,245,247,0.2)' },
  stepDotActive: { width: 20, backgroundColor: Colors.saffronGold },
  stepDotDone: { backgroundColor: 'rgba(232,168,124,0.5)' },
  linkText: { color: Colors.auroraRose, fontSize: 14, textAlign: 'center' },
  covenant: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  covenantText: { fontSize: 11, color: Colors.auroraRose, opacity: 0.8, textAlign: 'center' },
});
