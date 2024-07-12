import { View, Text, Image, Pressable, TextInput, TouchableOpacity, StyleProp, ViewStyle, TextInputProps, NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from './constants/colors';
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

import {router} from "expo-router"

import * as Font from "expo-font";
import * as api from "./api"

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./assets/fonts/Poppins-Medium.ttf'),
    'Montserrat': require('./assets/fonts/Montserrat.ttf'),
  });
};

// TODO : Add Form Validation. Validate each of the fields.
// TODO : Error handling when the message = ""

const Signup = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [password , setPassword] = useState("");
  const [email , setEmail] = useState("");
  const [number , setNumber] = useState("")
  const [message , setMessage] = useState("")

  useEffect(() => {
    fetchFonts();
  }, [])

  const handleSignup = async () => {
        // e.preventDefault();
        try {
            await api.signUp(email , number , password);
            setEmail("")
            setNumber("")
            setPassword("")
        } catch (error : any) {
            setMessage('Error: ' + error.message);
        }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212"}}>
      <View style={{ flex: 1, marginHorizontal: 22 }}>
        <View style={{ marginVertical: 22 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginVertical: 12,
            color: "white"
          }}>
            Create Account
          </Text>

          <Text style={{
            fontSize: 16,
            color: "white"
          }}>Shopping at your fingertips!</Text>
        </View>


        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color : "white"
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
          }}>Mobile Number</Text>

          <View style={{
            width: "100%",
            height: 48,
            borderColor: "white",
            borderWidth: 1,
            borderRadius: 8,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingLeft: 22
          }}>
            <TextInput
              value='+92'
              editable={false}
              placeholderTextColor={"white"}
              keyboardType='numeric'
              style={{
                width: "12%",
                borderRightWidth: 1,
                borderRightColor: COLORS.grey,
                height: "100%",
                color : "white",
              }}
            />

            <TextInput
              placeholder='Enter your phone number'
              placeholderTextColor={"white"}
              onChangeText={(text : string) => setNumber(`+92 ${text}`)}
              keyboardType='numeric'
              style={{
                width: "80%",
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
              onChangeText={(text : string) => setPassword(text)}
              placeholderTextColor={"white"}
              secureTextEntry={!isPasswordShown}
              style={{
                width: "100%",
                color : "white",
              }}
            />

            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: "absolute",
                right: 12
              }}
            >
              {isPasswordShown ? (
                <Ionicons name="eye-off" size={24} color={"white"} />
              ) : (
                <Ionicons name="eye" size={24} color={"white"} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          marginVertical: 6
        }}>
          <Checkbox
            style={{ marginRight: 8 }}
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? COLORS.primary : undefined}
          />

          <Text style={{color : "white"}}>I agree to the terms and conditions</Text>
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
              await handleSignup()
              router.navigate("/sign-in")
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
          <Text style={{ fontSize: 14 }}>Or Sign up with</Text>
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
          <TouchableOpacity
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
          </TouchableOpacity>

          <TouchableOpacity
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
          </TouchableOpacity>
        </View> */}

        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 22
        }}>
          <Text style={{ fontSize: 16, color: "white" }}>Already have an account</Text>
          <Pressable
            onPress={() => router.navigate("/sign-in")}
          >
            <Text style={{
              fontSize: 16,
              color: COLORS.primary,
              fontWeight: "bold",
              marginLeft: 6
            }}>Login</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;
