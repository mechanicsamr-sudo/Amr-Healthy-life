import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { ar } from '../../src/i18n/ar';
import { colors, fonts } from '../../src/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={icon} color={typeof color === 'string' ? color : colors.muted} size={size} />
  ),
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={tab(ar.tabs.home, 'home-outline')} />
      <Tabs.Screen name="feed" options={tab(ar.tabs.feed, 'newspaper-outline')} />
      <Tabs.Screen name="library" options={tab(ar.tabs.library, 'bookmark-outline')} />
      <Tabs.Screen name="settings" options={tab(ar.tabs.settings, 'settings-outline')} />
    </Tabs>
  );
}
