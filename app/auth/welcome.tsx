import { View, Text, Pressable, Image, StyleProp, ViewStyle, TextStyle } from 'react-native';
import React, {useEffect , useState} from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import Button from '../components/Button';

import {router} from "expo-router"
import AsyncStorage from '@react-native-async-storage/async-storage';

const Welcome = () => {
  useEffect(() => {
    AsyncStorage.setItem("authenticated" , "false")
  } , [])
  return (
    <LinearGradient
      style={{ flex: 1}}
      colors={[COLORS.secondary, COLORS.primary]}
    >
      <View style={{ flex: 1, height : 600}}>
        <View>
          <Image
            source={require("../assets/fashion/1.png")}
            style={{
              height: 100,
              width: 100,
              borderRadius: 20,
              position: "absolute",
              top: 10,
              transform: [
                { translateX: 20 },
                { translateY: 50 },
                { rotate: "-15deg" }
              ]
            }}
          />

          <Image
            source={require("../assets/fashion/2.png")}
            style={{
              height: 100,
              width: 100,
              borderRadius: 20,
              position: "absolute",
              top: -30,
              left: 100,
              transform: [
                { translateX: 50 },
                { translateY: 50 },
                { rotate: "-5deg" }
              ]
            }}
          />

          <Image
            source={require("../assets/fashion/2.png")}
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              position: "absolute",
              top: 130,
              left: -50,
              transform: [
                { translateX: 50 },
                { translateY: 50 },
                { rotate: "15deg" }
              ]
            }}
          />

          <Image
            source={require("../assets/fashion/3.png")}
            style={{
              height: 200,
              width: 200,
              borderRadius: 20,
              position: "absolute",
              top: 110,
              left: 100,
              transform: [
                { translateX: 50 },
                { translateY: 50 },
                { rotate: "-15deg" }
              ]
            }}
          />
        </View>

        {/* Content */}

        <View
          style={{
            paddingHorizontal: 22,
            position: "absolute",
            top: 400,
            width: "100%"
          }}
        >
          <Text
            style={{
              fontSize: 38,
              fontWeight: '800',
              color: COLORS.white
            }}
          >
            Stop Scrolling,{"\n"}Start Swiping
          </Text>

          

          <Button
            title="Join Now"
            onPress={() => router.navigate("/auth/sign-up")}
            style={{
              marginTop: 22,
              width: "100%"
            }}
          />

          <View
            style={{
              flexDirection: "row",
              marginTop: 12,
              justifyContent: "center"
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: COLORS.white
              }}
            >
              Already have an account ?
            </Text>
            <Pressable onPress={() => router.navigate("/auth/sign-in")}>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.white,
                  fontWeight: "bold",
                  marginLeft: 4
                }}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Welcome;
