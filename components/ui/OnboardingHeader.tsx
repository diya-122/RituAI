import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/theme';

export function OnboardingHeader({
  step,
  total = 5,
  onBack,
}: {
  step: number;
  total?: number;
  onBack?: () => void;
}) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.wrap}>
      <View style={styles.row}>
        <Pressable onPress={handleBack} style={styles.back} hitSlop={12}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.label}>Chapter {step} of {total}</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.seg,
              {
                backgroundColor:
                  i < step ? Colors.templeMaroon : 'rgba(123,45,63,0.15)',
              },
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: Colors.templeMaroon, fontWeight: '600' },
  label: { ...Typography.label, color: Colors.textSecondary },
  track: {
    flexDirection: 'row',
    gap: 6,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
