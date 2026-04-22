import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { CustomTabBar } from '@/components/CustomTabBar';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#FFF5F7' },
        }}
      >
        <Stack.Screen name="today" />
        <Stack.Screen name="cycle" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="saheli" />
        <Stack.Screen name="profile" />
      </Stack>
      <CustomTabBar />
    </View>
  );
}
