import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="chapter1" />
      <Stack.Screen name="chapter2" />
      <Stack.Screen name="chapter3" />
      <Stack.Screen name="chapter4" />
      <Stack.Screen name="chapter5" />
    </Stack>
  );
}
