import { View, Text, Image, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect} from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from './constants/colors';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from "expo-font";
import * as api from "./(tabs)/api"

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./assets/fonts/Poppins-Medium.ttf'),
    'Montserrat': require('./assets/fonts/Montserrat.ttf'),
  });
};

// TODO : Error handling when message = ""

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  // TODO : phone number or email
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")

  useEffect(() => {
    fetchFonts();
  } , [])

  const handleLogin = async () => {
        // e.preventDefault();
        try {
            await api.signIn(email, password);
            setEmail('')
            setPassword('')

        } catch (error : any) {
            alert('failed to login, error: ' + error.message);
        }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ flex: 1, marginHorizontal: 22 }}>
        <View style={{ marginVertical: 22 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginVertical: 12,
            color: "white"
          }}>
            Welcome Back ! 👋
          </Text>

          <Text style={{
            fontSize: 16,
            color: "white"
          }}>You have been missed!</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color : "white",
          }}>Email address</Text>

          <View style={{
            width: "100%",
            height: 48,
            borderColor: "white",
            borderWidth: 1,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 22
          }}>
            <TextInput
              placeholder='Enter your email address'
              onChangeText={(text : string) => setEmail(text)}
              placeholderTextColor={"white"}
              keyboardType='email-address'
              style={{
                width: "100%",
                color : "white",
              }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color : "white",
          }}>Password</Text>

          <View style={{
            width: "100%",
            height: 48,
            borderColor: "white",
            borderWidth: 1,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 22
          }}>
            <TextInput
              placeholder='Enter your password'
            //   value={password}
              onChangeText={(text:string) => setPassword(text)}
              placeholderTextColor={"white"}
              secureTextEntry={!isPasswordShown}
              style={{
                width: "100%",
                color: "white",
              }}
            />

            <Pressable
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: "absolute",
                right: 12
              }}
            >
              {
                isPasswordShown ? (
                  <Ionicons name="eye-off" size={24} color={"white"} />
                ) : (
                  <Ionicons name="eye" size={24} color={"white"} />
                )
              }
            </Pressable>
          </View>
        </View>

        <Pressable
        style={[
          {
            paddingBottom: 16,
            paddingVertical: 10,
            marginHorizontal : 14,
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center'
          },
          { backgroundColor: "white" },
        ]}
        onPress={async () => {
            try {
              await handleLogin()
              
          } catch (e){
              alert(`couldn't log in. error = ${e}`)
          }
          
        }}
      >
        <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }}>Sign in</Text>
      </Pressable>

        {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: COLORS.grey,
              marginHorizontal: 10
            }}
          />
          <Text style={{ fontSize: 14 }}>Or Login with</Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: COLORS.grey,
              marginHorizontal: 10
            }}
          />
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
          <Pressable
            onPress={() => console.log("Pressed")}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              height: 52,
              borderWidth: 1,
              borderColor: COLORS.grey,
              marginRight: 4,
              borderRadius: 10
            }}
          >
            <Image
              source={require("./assets/facebook.png")}
              style={{
                height: 36,
                width: 36,
                marginRight: 8
              }}
              resizeMode='contain'
            />

            <Text>Facebook</Text>
          </Pressable>

          <Pressable
            onPress={() => console.log("Pressed")}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              height: 52,
              borderWidth: 1,
              borderColor: COLORS.grey,
              marginRight: 4,
              borderRadius: 10
            }}
          >
            <Image
              source={require("./assets/google.png")}
              style={{
                height: 36,
                width: 36,
                marginRight: 8
              }}
              resizeMode='contain'
            />

            <Text>Google</Text>
          </Pressable>
        </View> */}

        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 22
        }}>
          <Text style={{ fontSize: 16, color: "white" }}>Don't have an account ? </Text>
          <Pressable
            onPress={() => router.navigate("/sign-up")}
          >
            <Text style={{
              fontSize: 16,
              color: COLORS.primary,
              fontWeight: "bold",
              marginLeft: 6
            }}>Register</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Login;
