import 'react-native-reanimated';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import React from "react";

import {Text, TextInput} from "react-native"

import { SessionProvider } from './backend/ctx';

import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_300Light } from '@expo-google-fonts/poppins'
import { Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import {Inter_300Light, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { refreshToken, setToken } from './backend/storage';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  let [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_300Light,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
  });
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;
  (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps.allowFontScaling = false;

  let montLoaded = true;
  
  useEffect(() => {
    if (loaded && montLoaded) {
      // get refresh token so that user stays logged in
      const second = 1000;
      const minute = second * 60;
      setTimeout(async () => {
        const token = await refreshToken()
        if (token !== null){
          setToken(token)
        } 
      }, minute * 2)

      SplashScreen.hideAsync();
    }
  }, [loaded, montLoaded]);

  if (!loaded || !montLoaded) {
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
