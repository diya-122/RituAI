import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { PhaseBackground } from '@/components/ui/PhaseBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { FloatingPetals } from '@/components/illustrations/FloatingPetals';
import { Colors, PhaseColors, Typography, Radius, PhaseKey } from '@/theme';
import { useStore } from '@/store/useStore';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Helper: figure out phase for each day (mock logic; backend will replace)
function getPhaseForDay(day: number, cycleDay: number, cycleLength: number): PhaseKey | null {
  if (day <= 5) return 'menstrual';
  if (day <= 12) return 'follicular';
  if (day <= 17) return 'ovulatory';
  if (day <= cycleLength) return 'luteal';
  return null;
}

export default function Cycle() {
  const phase = useStore((s) => s.currentPhase);
  const cycleDay = useStore((s) => s.cycleDay);
  const cycleLength = useStore((s) => s.cycleLength);
  const cycleVariance = useStore((s) => s.cycleVariance);

  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = viewDate.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth = monthOffset === 0;

  const cells = useMemo(() => {
    const arr: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < firstDayOfWeek; i++) arr.push({ day: null, key: `e-${i}` });
    for (let d = 1; d <= daysInMonth; d++) arr.push({ day: d, key: `d-${d}` });
    while (arr.length % 7 !== 0) arr.push({ day: null, key: `t-${arr.length}` });
    return arr;
  }, [firstDayOfWeek, daysInMonth]);

  return (
    <View style={{ flex: 1 }}>
      <PhaseBackground phase={phase} intensity={0.7} />
      <FloatingPetals count={3} colors={[PhaseColors[phase].secondary]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => { try { Haptics.selectionAsync(); } catch {}; setMonthOffset(monthOffset - 1); }}>
            <Text style={styles.arrow}>←</Text>
          </Pressable>
          <View>
            <Text style={styles.monthName}>{MONTHS[month]} {year}</Text>
            <Text style={styles.avgCycle}>
              avg {cycleLength}d ± {cycleVariance} · {cycleVariance > 4 ? 'irregular' : 'regular'}
            </Text>
          </View>
          <Pressable onPress={() => { try { Haptics.selectionAsync(); } catch {}; setMonthOffset(monthOffset + 1); }}>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card}>
            {/* Day headers */}
            <View style={styles.daysRow}>
              {DAYS.map((d, i) => (
                <Text key={i} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {cells.map((c) => {
                if (!c.day) {
                  return <View key={c.key} style={styles.cell} />;
                }
                const phaseForDay = isCurrentMonth
                  ? getPhaseForDay(c.day <= today ? c.day : 0, cycleDay, cycleLength)
                  : null;
                const isToday = isCurrentMonth && c.day === today;
                const isFuture = isCurrentMonth && c.day > today;
                const isSelected = selectedDay === c.day;
                const phaseColor = phaseForDay ? PhaseColors[phaseForDay].primary : null;

                return (
                  <Pressable
                    key={c.key}
                    style={styles.cell}
                    onPress={() => {
                      try { Haptics.selectionAsync(); } catch {}
                      setSelectedDay(c.day);
                    }}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        phaseColor && !isFuture && { backgroundColor: phaseColor },
                        isFuture && { backgroundColor: 'transparent', borderWidth: 1, borderColor: PhaseColors[phase].secondary, borderStyle: 'dashed' },
                        isToday && { borderWidth: 2, borderColor: Colors.saffronGold },
                        isSelected && { transform: [{ scale: 1.1 }] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: phaseColor && !isFuture ? Colors.lotusMist : Colors.textPrimary },
                        ]}
                      >
                        {c.day}
                      </Text>
                    </View>
                    {/* False-surge crescent marker */}
                    {isCurrentMonth && c.day === Math.max(1, today - 2) && (
                      <Text style={styles.crescent}>🌙</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          {/* Legend */}
          <View style={styles.legend}>
            {(Object.keys(PhaseColors) as PhaseKey[]).map((k) => (
              <View key={k} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PhaseColors[k].primary }]} />
                <Text style={styles.legendText}>{PhaseColors[k].name}</Text>
              </View>
            ))}
          </View>

          {/* Honesty banner */}
          {cycleVariance > 4 && (
            <GlassCard style={{ marginTop: 16, padding: 14, marginHorizontal: 16, borderLeftWidth: 3, borderLeftColor: Colors.saffronGold }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>🪷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: Colors.templeMaroon, marginBottom: 4 }}>Saheli's honest note</Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13, lineHeight: 19 }}>
                    Your cycles vary — predictions use dashed borders when I am uncertain. That is on purpose. I will not guess.
                  </Text>
                </View>
              </View>
            </GlassCard>
          )}

          {/* Selected day detail */}
          {selectedDay && (
            <GlassCard style={{ marginHorizontal: 16, marginTop: 16, padding: 18 }}>
              <Text style={styles.detailDay}>Day {selectedDay}</Text>
              <Text style={styles.detailBody}>
                {selectedDay > today ? 'No data yet — this is a prediction.' : 'Tap and hold any day for quick logging options.'}
              </Text>
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
  },
  arrow: {
    fontSize: 22,
    color: Colors.templeMaroon,
    fontWeight: '300',
    paddingHorizontal: 12,
  },
  monthName: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.templeMaroon,
    textAlign: 'center',
  },
  avgCycle: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 14,
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    ...Typography.label,
    color: Colors.textMuted,
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  crescent: {
    position: 'absolute',
    top: 0,
    right: 2,
    fontSize: 11,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 14,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  detailDay: {
    fontSize: 24,
    fontWeight: '300',
    fontStyle: 'italic',
    color: Colors.templeMaroon,
  },
  detailBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
});
