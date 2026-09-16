import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 74,
          paddingBottom: isWeb ? 28 : 8,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color }) =>
            <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen name="people" options={{ title: 'الأشخاص', tabBarIcon: ({ color }) => <Feather name="users" size={20} color={color} /> }} />
      <Tabs.Screen name="operations" options={{ title: 'العمليات', tabBarIcon: ({ color }) => <Feather name="list" size={20} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'التقارير', tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={20} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'الإعدادات', tabBarIcon: ({ color }) => <Feather name="settings" size={20} color={color} /> }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ClassicTabLayout />;
}
