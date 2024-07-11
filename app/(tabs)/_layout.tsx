import { Tabs } from 'expo-router';
import React from 'react';

// icons
import Feather from '@expo/vector-icons/Feather';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Dimensions, Platform } from 'react-native';

import {StyleSheet} from "react-native";

import * as size from "react-native-size-matters";

let { height: screenHeight , width : screenWidth } = Dimensions.get('window');
let factor = screenHeight/screenWidth;
if (factor < 1){
  factor = 2;
}
let paddingTop = 15;
let paddingBottom = 20;
let vPadding = paddingTop + paddingBottom;
let heightBoost = 0;

if (Platform.OS === "android"){
  paddingTop = size.verticalScale(15/factor);
  paddingBottom = size.verticalScale(20/factor);
  vPadding = paddingTop + paddingBottom;

  heightBoost = -10;
}
if (Platform.OS === "ios"){
  paddingTop = size.verticalScale(15/factor);
  paddingBottom = size.verticalScale(20/factor);
  vPadding = paddingTop + paddingBottom;

  heightBoost = 10;
}

export const tabBarHeight = size.verticalScale((80/factor) + vPadding + heightBoost);
export default function TabLayout() {
  

  // so that tabBarHeight is inversely proportional to screen height
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "red",
        headerShown: false,
        tabBarStyle : {
          backgroundColor : "black",
          borderTopColor : "black",
          paddingTop : paddingTop,
          paddingBottom : paddingBottom,
          height : tabBarHeight , 

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
        name="discover"
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
