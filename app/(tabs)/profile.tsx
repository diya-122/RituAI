import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/ui/GlassCard';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { LotusMark } from '@/components/illustrations/Scenes';
import { Colors, Gradients, Typography, Radius } from '@/theme';
import { useStore } from '@/store/useStore';

export default function Profile() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const disguiseMode = useStore((s) => s.disguiseMode);
  const toggleDisguise = useStore((s) => s.toggleDisguise);
  const logout = useStore((s) => s.logout);
  const logs = useStore((s) => s.logs);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={Gradients.lotus as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <FloatingPetals count={3} colors={['#E8B4C8', '#C9B8E8']} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              <LotusMark size={64} />
            </View>
            <Text style={styles.name}>{user?.name || 'Friend'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.streakWrap}>
              <Text style={styles.streakEmoji}>🌱</Text>
              <Text style={styles.streakText}>
                <Text style={{ fontWeight: '800' }}>{logs.length}</Text> days of self-ritual
              </Text>
            </View>
          </View>

          {/* Admin panel link if admin */}
          {user?.role === 'ADMIN' && (
            <Pressable onPress={() => router.push('/admin')}>
              <GlassCard style={[styles.section, { borderColor: Colors.saffronGold, borderWidth: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>🛠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>Admin panel</Text>
                    <Text style={styles.rowSub}>Dashboards, users, content, AI ops</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </View>
              </GlassCard>
            </Pressable>
          )}

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Privacy & safety</Text>
            <Row
              label="Disguise mode"
              sub="Icon & name appear neutral on shared devices"
              value={disguiseMode}
              onToggle={() => {
                try { Haptics.selectionAsync(); } catch {}
                toggleDisguise();
              }}
            />
            <Divider />
            <PressRow label="App lock (PIN / biometric)" onPress={() => {}} />
            <Divider />
            <PressRow label="Local-first storage" sub="Keep data on device until you sync" onPress={() => {}} />
            <Divider />
            <PressRow label="Delete all my data" danger onPress={() => {}} />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Personalization</Text>
            <PressRow label="Theme" sub="Auto · Day · Night · Seasonal" onPress={() => {}} />
            <Divider />
            <PressRow label="Language" sub="English (Hindi, Tamil coming soon)" onPress={() => {}} />
            <Divider />
            <PressRow label="Saheli's tone" sub="Warm · Clinical · Poetic" onPress={() => {}} />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>🧘 Ritual</Text>
            <PressRow
              label="Replay Saheli's tour"
              sub="See the spotlight walkthrough again"
              onPress={() => {
                useStore.setState({ hasSeenTutorial: false });
                router.replace('/(tabs)/today');
              }}
            />
            <Divider />
            <PressRow label="Daily check-in time" sub="Currently 8:00 AM" onPress={() => {}} />
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>❤️ About</Text>
            <PressRow label="Research sources" onPress={() => {}} />
            <Divider />
            <PressRow label="Team Elle — credits" onPress={() => {}} />
            <Divider />
            <PressRow label="Privacy covenant" onPress={() => {}} />
          </GlassCard>

          {/* Dev: Admin toggle for demo (so you can see admin screens) */}
          <GlassCard style={[styles.section, { borderWidth: 1, borderColor: 'rgba(123,45,63,0.15)' }]}>
            <Text style={styles.sectionTitle}>🧪 Demo mode</Text>
            <PressRow
              label="Toggle admin role"
              sub="For showcasing admin screens"
              onPress={() => {
                useStore.setState({
                  user: user ? { ...user, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' } : null,
                });
              }}
            />
            <Divider />
            <PressRow label="Log out" danger onPress={() => {
              logout();
              router.replace('/(auth)/welcome');
            }} />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Row({ label, sub, value, onToggle }: any) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(123,45,63,0.2)', true: Colors.saffronGold }}
        thumbColor={value ? Colors.templeMaroon : '#fff'}
      />
    </View>
  );
}

function PressRow({ label, sub, onPress, danger }: any) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 18,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(123,45,63,0.15)',
  },
  name: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.templeMaroon,
    marginTop: 10,
    fontStyle: 'italic',
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  streakEmoji: { fontSize: 14 },
  streakText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.templeMaroon,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  rowSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chev: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(123,45,63,0.08)',
  },
});
