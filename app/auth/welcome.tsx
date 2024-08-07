import { View, Text, Pressable, ImageBackground } from 'react-native';
import React, {useEffect , useState} from 'react';
import COLORS from '../constants/colors';
import {PrimaryButton} from '../components/button';

import {router} from "expo-router"
import { storage } from '../backend/storage';


const Welcome = () => {
  storage.set("Authenticated" , "false")
  return (
    <ImageBackground
      style={{ flex: 1, backgroundColor : "black"}}
      imageStyle={{
        opacity : 0.45,
      }}
      source={require("../assets/fresco.jpg")}
    >
      <View 
        style={{ 
          flex: 1, 
          height : 600,
          justifyContent : "center",
          alignItems : "center",
        }}
      >

        {/* Content */}

        <View
          style={{
            paddingHorizontal: 22,
            position: "absolute",
            
            width: "100%"
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontFamily : "Inter_500Medium",
              color : "white",
            }}
          >
            A community of small & passionate sellers
          </Text>

          

          <PrimaryButton
            text="Join Now"
            onPress={() => router.navigate("/auth/sign-up")}
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
    </ImageBackground>
  );
};

export default Welcome;
