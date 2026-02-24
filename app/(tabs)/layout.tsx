import React from 'react';
import { Tabs } from 'expo-router';
import { Inbox, ShieldBan, Shield, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useMessages } from '@/providers/MessagesProvider';

export default function TabLayout() {
  const { spamMessages } = useMessages();
  const unreadSpam = spamMessages.filter(m => !m.isRead).length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(inbox)"
        options={{
          title: 'Gelen Kutusu',
          tabBarIcon: ({ color, size }) => <Inbox size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="spam"
        options={{
          title: 'Spam',
          tabBarIcon: ({ color, size }) => <ShieldBan size={size} color={color} />,
          tabBarBadge: unreadSpam > 0 ? unreadSpam : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.danger,
            color: Colors.white,
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />
      <Tabs.Screen
        name="shield"
        options={{
          title: 'Koruma',
          tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
