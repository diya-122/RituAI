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
import { Colors, Gradients, Radius, Typography } from '@/theme';
import { useStore } from '@/store/useStore';

const { height: H } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [step, setStep] = useState<'closed' | 'opening' | 'form'>('closed');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminHint, setShowAdminHint] = useState(false);

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
      setStep('form');
      formOp.value = withTiming(1, { duration: 600 });
      formY.value = withSpring(0, { damping: 14, stiffness: 120 });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }, 900);
  };

  const canSubmit = email.includes('@') && password.length >= 4;

  const handleLogin = () => {
    if (!canSubmit) return;
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    const isAdmin =
      email.toLowerCase() === 'admin@ritualai.in' ||
      email.toLowerCase() === 'admin@ritual.ai';
    login({ name: isAdmin ? 'Admin' : 'Friend', email });
    router.replace(isAdmin ? '/admin' : '/(tabs)/today');
  };

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value }));
  const doorWrapStyle = useAnimatedStyle(() => ({ transform: [{ scale: doorScale.value }] }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOp.value, transform: [{ translateY: formY.value }],
  }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hintOp.value, [0, 1], [0.3, 1]),
    transform: [{ translateY: interpolate(hintOp.value, [0, 1], [0, -4]) }],
  }));

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
              <Text style={styles.kicker}>WELCOME BACK</Text>
              <Text style={styles.heading}>Step back in</Text>
              <Text style={styles.sub}>Your rhythm has been waiting.</Text>
            </Animated.View>

            <Pressable onPress={step === 'closed' ? openDoor : undefined}>
              <Animated.View style={[styles.doorWrap, doorWrapStyle]}>
                <Doorway size={240} open={step !== 'closed'} />
              </Animated.View>
            </Pressable>

            {step === 'closed' && (
              <Animated.View style={[{ alignItems: 'center', marginTop: 8 }, hintStyle]}>
                <Text style={styles.hintText}>Tap the door to log in</Text>
              </Animated.View>
            )}

            {step === 'form' && (
              <Animated.View style={[styles.formWrap, formStyle]}>
                <TextInput
                  value={email} onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,245,247,0.4)"
                  style={styles.input}
                  keyboardType="email-address" autoCapitalize="none"
                />
                <View style={{ height: 10 }} />
                <TextInput
                  value={password} onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,245,247,0.4)"
                  style={styles.input} secureTextEntry
                />
                <View style={{ height: 16 }} />
                <PrimaryButton
                  title="Enter" variant="gold"
                  onPress={handleLogin} disabled={!canSubmit}
                />

                {/* Admin credentials helper */}
                <Pressable onPress={() => setShowAdminHint((v) => !v)} style={styles.adminToggle}>
                  <Text style={styles.adminToggleText}>
                    {showAdminHint ? '▼' : '▶'}  Demo / admin access
                  </Text>
                </Pressable>
                {showAdminHint && (
                  <View style={styles.adminBox}>
                    <Text style={styles.adminLabel}>ADMIN EMAIL</Text>
                    <Text style={styles.adminValue}>admin@ritualai.in</Text>
                    <Text style={styles.adminLabel}>PASSWORD</Text>
                    <Text style={styles.adminValue}>admin123</Text>
                    <Pressable
                      onPress={() => {
                        setEmail('admin@ritualai.in');
                        setPassword('admin123');
                        try { Haptics.selectionAsync(); } catch {}
                      }}
                      style={styles.adminFillBtn}
                    >
                      <Text style={styles.adminFillText}>Auto-fill</Text>
                    </Pressable>
                  </View>
                )}
              </Animated.View>
            )}

            <Pressable onPress={() => router.replace('/(auth)/signup')} style={{ marginTop: 28 }}>
              <Text style={styles.linkText}>
                New here?  <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>Create an account</Text>
              </Text>
            </Pressable>
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
  formWrap: { width: '100%', maxWidth: 420, marginTop: 20 },
  input: {
    backgroundColor: 'rgba(255,245,247,0.1)', borderWidth: 1,
    borderColor: 'rgba(232,168,124,0.4)', borderRadius: Radius.pill,
    paddingHorizontal: 22, paddingVertical: 16, fontSize: 16,
    color: Colors.lotusMist, textAlign: 'center',
  },
  adminToggle: { marginTop: 20, alignItems: 'center' },
  adminToggleText: { color: 'rgba(232,168,124,0.8)', fontSize: 12 },
  adminBox: {
    marginTop: 10, padding: 14, backgroundColor: 'rgba(232,168,124,0.1)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(232,168,124,0.3)',
  },
  adminLabel: { fontSize: 9, fontWeight: '800', color: Colors.saffronGold, letterSpacing: 1.5, marginBottom: 2 },
  adminValue: { color: Colors.lotusMist, fontSize: 13, marginBottom: 8 },
  adminFillBtn: {
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 999, backgroundColor: Colors.saffronGold,
  },
  adminFillText: { color: Colors.midnightPlum, fontWeight: '700', fontSize: 12 },
  linkText: { color: Colors.auroraRose, fontSize: 14, textAlign: 'center' },
});
