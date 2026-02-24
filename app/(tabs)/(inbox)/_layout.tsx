import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function InboxLayout() {
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
        options={{ title: 'Gelen Kutusu' }}
      />
    </Stack>
  );
}
