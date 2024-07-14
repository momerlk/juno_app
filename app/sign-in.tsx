import { View, Text, Image, Pressable, ScrollView, TextInput } from 'react-native';
import React, { useState, useEffect} from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from './constants/colors';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from "expo-font";
import * as api from "./api"
import { PrimaryButton } from './_common';


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
        let ok = false;
        try {
            ok = await api.signIn(email, password);
            setEmail('')
            setPassword('')

        } catch (error : any) {
            alert('failed to login, error: ' + error.message);
        }

        if(ok){
          router.replace("/")
        }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <ScrollView style={{ flex: 1, marginHorizontal: 22 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop : 40, marginBottom : 55 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            marginVertical: 12,
            fontFamily : "Poppins",
            color: "white"
          }}>
            Sign in into your account
          </Text>

          <Text style={{
            fontSize: 16,
            color: "white"
          }}>Enter the details below</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color : "white",
          }}>Email address or username</Text>

          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TextInput
              placeholder='Enter email or username'
              value={email}
              onChangeText={(text : string) => setEmail(text)}
              placeholderTextColor={"white"}
              keyboardType='email-address'
              style={{
                width: "100%",
                color: "white",
                fontSize : 16,
                fontFamily : "Montserrat",
                backgroundColor : "#222222",
                height: 48,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22
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
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TextInput
              placeholder='Enter password'
              value={password}
              onChangeText={(text:string) => setPassword(text)}
              placeholderTextColor={"white"}
              secureTextEntry={!isPasswordShown}
              style={{
                width: "100%",
                color: "white",
                fontSize : 16,
                fontFamily : "Montserrat",
                backgroundColor : "#222222",
                height: 48,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22
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

        <PrimaryButton 
          text="Sign in" 
            onPress={async () => {
              try {
                await handleLogin()
                
            } catch (e){
                alert(`couldn't log in. error = ${e}`)
            }
            
          }}
        />

        

        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 22
        }}>
          <Text style={{ fontSize: 16, color: "white",fontFamily : "Poppins",}}>Don't have an account ? </Text>
          <Pressable
            onPress={() => router.navigate("/sign-up")}
          >
            <Text style={{
              fontSize: 17,
              marginLeft: 6,
              color : "white",
              textDecorationLine : "underline",
            }}>Register</Text>
          </Pressable>
        </View>

      <View style={{paddingVertical : 200}}/>

      </ScrollView>
    </SafeAreaView>
  );
}

export default Login;
