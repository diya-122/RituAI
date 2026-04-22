import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { PhaseBackground } from '@/components/ui/PhaseBackground';
import { Colors, PhaseColors, Typography, Radius, Shadows } from '@/theme';
import { useStore, ChatMessage } from '@/store/useStore';

const SUGGESTIONS = [
  'Why am I breaking out today?',
  'What should I eat this week?',
  'Explain my last scan',
  'Should I see a doctor?',
];

export default function Saheli() {
  const phase = useStore((s) => s.currentPhase);
  const chat = useStore((s) => s.chat);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chat.length, isTyping]);

  const send = (content: string) => {
    if (!content.trim()) return;
    try { Haptics.selectionAsync(); } catch {}
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setText('');
    setIsTyping(true);

    // Simulated Saheli reply (backend would stream Claude Sonnet here)
    setTimeout(() => {
      const replies = [
        'From what I see in your recent logs, this likely ties back to your luteal phase — progesterone is at its highest, and your skin often reacts. Anti-inflammatory foods help: turmeric milk, walnuts, and plenty of water.',
        'Your last scan showed a jawline-concentrated pattern. That is one of the most distinctive signs of hormonal acne. We will keep watching — this is useful data for your doctor.',
        'You are currently in your ' + PhaseColors[phase].name.toLowerCase() + ' phase. For the next few days, lean into dal, paneer, methi, and gentle movement. Save intense workouts for your follicular week.',
      ];
      const r = replies[Math.floor(Math.random() * replies.length)];
      addChatMessage({
        id: `s-${Date.now()}`,
        role: 'saheli',
        content: r,
        timestamp: new Date().toISOString(),
      });
      setIsTyping(false);
    }, 1400);
  };

  return (
    <View style={{ flex: 1 }}>
      <PhaseBackground phase={phase} intensity={0.4} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: PhaseColors[phase].secondary }]}>
            <Text style={{ fontSize: 22 }}>🪷</Text>
          </View>
          <View>
            <Text style={styles.name}>Saheli</Text>
            <Text style={styles.status}>
              <Text style={{ color: Colors.success }}>●</Text> here for you
            </Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={20}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {chat.map((m) => (
              <Bubble key={m.id} message={m} phase={phase} />
            ))}
            {isTyping && <TypingIndicator />}

            {/* Suggestions */}
            {chat.length < 3 && !isTyping && (
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    style={styles.suggChip}
                    onPress={() => send(s)}
                  >
                    <Text style={styles.suggText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Ask Saheli anything..."
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={() => send(text)}
              style={[
                styles.sendBtn,
                { backgroundColor: text.trim() ? Colors.templeMaroon : 'rgba(123,45,63,0.25)' },
              ]}
              disabled={!text.trim()}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Bubble({ message, phase }: { message: ChatMessage; phase: any }) {
  const isUser = message.role === 'user';
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withTiming(0, { duration: 400 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (isUser) {
    return (
      <Animated.View style={[styles.bubbleUserWrap, style]}>
        <View style={[styles.bubbleUser, { backgroundColor: PhaseColors[phase].primary }]}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.bubbleSahiWrap, style]}>
      <View style={[styles.sahiAvatar, { backgroundColor: PhaseColors[phase].secondary }]}>
        <Text style={{ fontSize: 15 }}>🪷</Text>
      </View>
      <View style={styles.bubbleSahi}>
        <Text style={styles.sahiText}>{message.content}</Text>
      </View>
    </Animated.View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.bubbleSahiWrap}>
      <View style={[styles.sahiAvatar, { backgroundColor: Colors.auroraRose }]}>
        <Text style={{ fontSize: 15 }}>🪷</Text>
      </View>
      <View style={styles.typingBubble}>
        <TypingDot delay={0} />
        <TypingDot delay={200} />
        <TypingDot delay={400} />
      </View>
    </View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(v.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(v.value, [0, 1], [0.8, 1.2]) }],
  }));
  return <Animated.View style={[styles.typingDot, style]} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.templeMaroon,
    fontStyle: 'italic',
  },
  status: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  bubbleUserWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 6,
  },
  bubbleUser: {
    maxWidth: '78%',
    borderRadius: 20,
    borderTopRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    color: Colors.lotusMist,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleSahiWrap: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
    gap: 8,
  },
  sahiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubbleSahi: {
    maxWidth: '78%',
    backgroundColor: 'rgba(255,245,247,0.95)',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  sahiText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,245,247,0.95)',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.templeMaroon,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center',
  },
  suggChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,245,247,0.85)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(123,45,63,0.2)',
  },
  suggText: {
    color: Colors.templeMaroon,
    fontSize: 13,
    fontWeight: '500',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 110 : 100,
    gap: 10,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: 'rgba(255,245,247,0.95)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: Colors.lotusMist,
    fontSize: 22,
    fontWeight: '700',
  },
});
