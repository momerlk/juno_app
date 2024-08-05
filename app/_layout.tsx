import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import React from "react";

import { SessionProvider } from './backend/ctx';
import { fetchFonts } from './backend/util';

import {Text, TextInput} from "react-native"


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loaded = fetchFonts();
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;
  (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps.allowFontScaling = false;

  useEffect(() => {
    
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return (
    <SessionProvider>
      <Stack
          screenOptions={{
            // Hide the header for all other routes.
            headerShown: false,
          }}
        >
      </Stack>
    </SessionProvider>
  )

}
