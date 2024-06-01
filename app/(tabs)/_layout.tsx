import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "red",
        headerShown: false,
        tabBarStyle : {height : 60 , padding : 10},
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="liked"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cart' : 'cart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
