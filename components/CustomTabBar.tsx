import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Gradients, Shadows } from '@/theme';
import { useStore } from '@/store/useStore';

const TABS = [
  { route: '/(tabs)/today', label: 'Today', icon: HomeIcon },
  { route: '/(tabs)/cycle', label: 'Cycle', icon: CalendarIcon },
  { route: '/scan', label: 'Scan', icon: null, isFab: true },
  { route: '/(tabs)/insights', label: 'Insights', icon: ChartIcon },
  { route: '/(tabs)/saheli', label: 'Saheli', icon: ChatIcon },
];

export function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const setTutorialSpot = useStore((s) => s.setTutorialSpot);
  const fabRef = useRef<View>(null);

  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.6, 0.95]),
  }));

  const handlePress = (route: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    router.push(route as any);
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {Platform.OS !== 'web' && (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.bar}>
        {TABS.map((tab, i) => {
          const active =
            pathname === tab.route ||
            pathname?.startsWith(tab.route.replace('/(tabs)', '')) ||
            (tab.route === '/(tabs)/today' && pathname === '/today');

          if (tab.isFab) {
            return (
              <Pressable
                key={i}
                onPress={() => handlePress(tab.route)}
                style={styles.fabWrap}
              >
                <Animated.View style={[styles.fabGlow, pulseStyle]} />
                <View
                  ref={fabRef}
                  style={styles.fab}
                  onLayout={() => {
                    fabRef.current?.measureInWindow((x, y, w, h) => {
                      setTutorialSpot('fab', { cx: x + w / 2, cy: y + h / 2, r: w / 2 + 8 });
                    });
                  }}
                >
                  <LinearGradient
                    colors={Gradients.goldShimmer as unknown as readonly [string, string, string]}
                    style={StyleSheet.absoluteFill}
                  />
                  <CameraMandala />
                </View>
                <Text style={[styles.label, { color: Colors.templeMaroon, fontWeight: '700' }]}>Scan</Text>
              </Pressable>
            );
          }

          const Icon = tab.icon;
          return (
            <Pressable
              key={i}
              onPress={() => handlePress(tab.route)}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconWrap,
                  active && { backgroundColor: 'rgba(232,168,124,0.2)' },
                ]}
              >
                {Icon ? <Icon active={!!active} /> : null}
              </View>
              <Text
                style={[
                  styles.label,
                  active && { color: Colors.templeMaroon, fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? Colors.templeMaroon : Colors.textMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M3 12 L12 3 L21 12 V20 A1 1 0 0 1 20 21 H15 V15 H9 V21 H4 A1 1 0 0 1 3 20 Z" stroke={c} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}
function CalendarIcon({ active }: { active: boolean }) {
  const c = active ? Colors.templeMaroon : Colors.textMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M4 6 H20 V20 A1 1 0 0 1 19 21 H5 A1 1 0 0 1 4 20 Z M4 10 H20 M8 3 V7 M16 3 V7" stroke={c} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
      <Circle cx={12} cy={15} r={1.5} fill={c} />
    </Svg>
  );
}
function ChartIcon({ active }: { active: boolean }) {
  const c = active ? Colors.templeMaroon : Colors.textMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M4 20 L10 14 L14 18 L20 9" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={10} cy={14} r={2} fill={c} />
      <Circle cx={20} cy={9} r={2} fill={c} />
    </Svg>
  );
}
function ChatIcon({ active }: { active: boolean }) {
  const c = active ? Colors.templeMaroon : Colors.textMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M5 5 H19 A2 2 0 0 1 21 7 V15 A2 2 0 0 1 19 17 H12 L7 21 V17 H5 A2 2 0 0 1 3 15 V7 A2 2 0 0 1 5 5 Z" stroke={c} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}
function CameraMandala() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      <Circle cx={15} cy={15} r={8} stroke="#7B2D3F" strokeWidth={1.8} fill="#FFF5F7" />
      <Circle cx={15} cy={15} r={4} fill="#7B2D3F" />
      <Path d="M8 10 L11 7 H19 L22 10" stroke="#7B2D3F" strokeWidth={1.8} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 20 : 12,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,245,247,0.92)' : 'rgba(255,245,247,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    ...Shadows.heavy,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
  },
  fabGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.saffronGold,
    top: 0,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF5F7',
    ...Shadows.glow,
  },
});
