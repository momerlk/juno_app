import { View, Text, Image, Pressable,
   TextInput, TouchableOpacity,
    ScrollView} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

import {router} from "expo-router"

import * as Font from "expo-font";
import * as api from "../backend/api"
import * as size from "react-native-size-matters"
import { DropDown as DropDownPicker } from '../components/_common';
import { fetchFonts } from '../backend/util';
import { PrimaryInput, PasswordInput } from '../components/input';
import { PrimaryButton, SecondaryButton} from '../components/button';

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
  const [name , setName] = useState("")
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
              name : name,
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
      <ScrollView style={{ flex: 1, paddingBottom : 100}}
        showsVerticalScrollIndicator={false} 
      >
        <Image
          source={{
            uri : "https://daily.jstor.org/wp-content/uploads/2017/09/indian_dress_1050x700.jpg"
          }} 
          style={{height : 400}}
        />
        <View style={{marginHorizontal : 22}}>
          <View style={{ marginVertical: 22 }}>
            <Text style={{
              fontSize: 22,
              fontFamily : "Inter_500Medium",
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



          <PrimaryInput 
            label="Email"
            placeholder='Enter your email address'
            keyboardType="email-address"
            onChangeText={text => setEmail(text)} 
          />

          <PrimaryInput 
            label="Phone"
            placeholder='With country code +92 or +91'
            keyboardType="phone-pad"
            onChangeText={text => setNumber(text)} 
          />

          <PrimaryInput 
            label="Age"
            placeholder='Enter your age'
            keyboardType="numeric"
            onChangeText={text => setAge(parseInt(text))} 
          />

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
                setGender(v[0])
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

          
          <PasswordInput 
            label="Password"
            placeholder='Enter a secure password'
            onChangeText={text => setPassword(text)} 
          />

          <PasswordInput 
            label="Confirm Password"
            placeholder='Enter your password again'
            onChangeText={text => setPassword(text)} 
          />


          <PrimaryButton 
            onPress={async () => {
                  try {
                    await handleSignup()
                    router.navigate("/auth/sign-in")
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
            <Text style={{ fontSize: 16, color: "white", fontFamily : "Poppins_400Regular" }}>Already have an account ?</Text>
            <Pressable
              onPress={() => router.navigate("/auth/sign-in")}
            >
              <Text style={{
                fontSize: 17,
                color: "white",
                marginLeft: 6,
                textDecorationLine : "underline",
              }}>Login</Text>
            </Pressable>
          </View>

          <View style={{paddingVertical : 200}}/>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
