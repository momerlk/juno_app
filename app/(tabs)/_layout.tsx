import { Tabs } from 'expo-router';
import React from 'react';

// icons
import Feather from '@expo/vector-icons/Feather';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';



import {StyleSheet} from "react-native";

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as size from "react-native-size-matters";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "red",
        headerShown: false,
        tabBarStyle : {
          backgroundColor : "black",
          borderTopWidth : StyleSheet.hairlineWidth,
          paddingVertical : size.verticalScale(10),
          borderColor : "#2D2D2D",
          height : size.verticalScale(50) , 
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => {
            if (!focused){
              return <Feather name="home" size={24} color="white" />
            } else {
              return <Foundation name="home" size={24} color="white" />
            }
          },
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => {
            if (!focused){
              return <Ionicons name="compass-outline" size={24} color="white" />
            } else {
              return <Ionicons name="compass" size={24} color="white" />
            }
          },
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => {
            if (!focused){
              return <Ionicons name="search-outline" size={24} color="white" />
            } else {
              return <Ionicons name="search" size={24} color="white" />
            }
          },
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => {
            if (!focused){
              return <Ionicons name="cart-outline" size={24} color="white" />
            } else {
              return <Ionicons name="cart" size={24} color="white" />
            }
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => {
            if (!focused){
              return <FontAwesome name="user-o" size={24} color="white" />
            } else {
              return <FontAwesome name="user" size={24} color="white" />
            }
          },
        }}
      />
    </Tabs>
  );
}
