import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function ShieldLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Koruma Kalkanı' }}
      />
    </Stack>
  );
}
