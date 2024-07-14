import { View, Text, Image, Pressable,
   TextInput, TouchableOpacity,
    ScrollView} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from './constants/colors';
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

import {router} from "expo-router"

import * as Font from "expo-font";
import * as api from "./api"
import * as size from "react-native-size-matters"
import { PrimaryButton, SecondaryButton, DropDown as DropDownPicker } from './_common';

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
  const [confirmPassword , setConfirmPassword] = useState("")
  const [email , setEmail] = useState("");
  const [username, setUsername] = useState("")
  const [number , setNumber] = useState("")
  const [gender , setGender] = useState("") 
  const [age, setAge] = useState(0) 
  const [dateOfBirth , setDateOfBirth] = useState("")
  
  const [message , setMessage] = useState("")
  
  useEffect(() => {
    fetchFonts();
  }, [])

  const handleSignup = async () => {
        // e.preventDefault();
        try {
            await api.signUp({
              username : username,
              email : email,
              password : password,
              number : number,
              age : age,
              gender : gender,
            });
            setEmail("")
            setNumber("")
            setPassword("")
            setEmail("")
            setAge(0)
            setGender("")
        } catch (error : any) {
            setMessage('Error: ' + error.message);
        }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212"}}>
      <ScrollView style={{ flex: 1, marginHorizontal: 22, paddingBottom : 100}}
        showsVerticalScrollIndicator={false} 
      >
        <View style={{ marginVertical: 22 }}>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily : "Poppins",
            marginVertical: 12,
            color: "white"
          }}>
            Create Your Account
          </Text>

          <Text style={{
            fontSize: 16,
            color: "white",
          }}>Fill in all the details below to create your account!</Text>
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
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TextInput
              placeholder='Enter your email address'
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
            color : "white"
          }}>Username </Text>

          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TextInput
              placeholder='Enter your username'
              value={username}
              onChangeText={(text : string) => setUsername(text)}
              placeholderTextColor={"white"}
              keyboardType='default'
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
          }}>Mobile Number </Text>

          <View style={{
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
            <TextInput
              value='+92'
              editable={false}
              placeholderTextColor={"white"}
              keyboardType='phone-pad'
              style={{
                width: "30%",
                color: "white",
                fontSize : 16,
                fontFamily : "Montserrat",
                backgroundColor : "#222222",
                height: 48,
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 22,
                borderColor : "white",
                borderRightWidth : 2,
              }}
            />

            <TextInput
              placeholder='Enter your phone number'
              placeholderTextColor={"white"}
              onChangeText={(text : string) => setNumber(`+92 ${text}`)}
              keyboardType='phone-pad'
              style={{
                width: "100%",
                color: "white",
                fontSize : 16,
                fontFamily : "Montserrat",
                backgroundColor : "#222222",
                height: 48,
                borderTopRightRadius : 8,
                borderBottomRightRadius: 8,
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
            color : "white"
          }}>Age </Text>

          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TextInput
              placeholder='Enter your age'
              onChangeText={(text : string) => setAge(parseInt(text))}
              placeholderTextColor={"white"}
              keyboardType='numeric'
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

        <View style={{ marginBottom: 15 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color : "white",
          }}>Gender </Text>
          <DropDownPicker
            data={[{label : "Male", value : "male"}, {label : "Female", value : "female"} , {label : "Other" , value : "Other"}]} 
            title={"Gender"}
            onChange={(v : string) => {
              setGender(gender)
            }}
            selected={null}
            multiple={false}
            range={{min : [], max : []}}
            onPress={() => {}}
            containerStyle={{
              width : "100%",
              marginHorizontal : 0,
            }}
            buttonStyle={{
              width : "100%",
              backgroundColor : "#222222",
              marginHorizontal : 0,
              height : 51,
            }}
            textStyle={{
              color : "white",
              marginTop : 4,
              marginLeft : 6,  
              fontSize : 15,
              fontFamily : "Montserrat"
            }}
          />
        </View>

        <View style={{ marginBottom: 15 }}>
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
              placeholder='Enter your password'
              onChangeText={(text : string) => setPassword(text)}
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

        <View style={{ marginBottom: 15 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '400',
            marginVertical: 8,
            color : "white",
          }}>Confirm Password</Text>

          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TextInput
              placeholder='Confirm your password'
              onChangeText={(text : string) => setConfirmPassword(text)}
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

        <PrimaryButton 
          onPress={async () => {
                try {
                  await handleSignup()
                  router.navigate("/sign-in")
              } catch (e){
                  alert(`couldn't create account . error = ${e}`)
              } 
          }}
          text="Create account" 
        />


        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 22
        }}>
          <Text style={{ fontSize: 16, color: "white", fontFamily : "Poppins" }}>Already have an account ?</Text>
          <Pressable
            onPress={() => router.navigate("/sign-in")}
          >
            <Text style={{
              fontSize: 17,
              color: "white",
              marginLeft: 6,
              textDecorationLine : "underline",
            }}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
