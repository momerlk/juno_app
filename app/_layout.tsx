import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import React from "react";

import { SessionProvider } from './backend/ctx';
import { Slot } from 'expo-router';
import { fetchFonts } from './backend/util';



// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loaded = fetchFonts();

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
