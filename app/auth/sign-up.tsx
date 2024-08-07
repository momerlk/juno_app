import { View, Text, Image, Pressable,
   TextInput, TouchableOpacity,
    ScrollView,
    ImageBackground} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import COLORS from '../constants/colors';
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

import {router} from "expo-router"

import * as Font from "expo-font";
import * as api from "../backend/api"
import * as size from "react-native-size-matters"
import { asyncTimeout, DropDown as DropDownPicker } from '../components/_common';
import { PrimaryInput, PasswordInput , SelectInput} from '../components/input';
import { PrimaryButton, SecondaryButton} from '../components/button';
import { validateEmail, validatePassword, validatePhoneNumber, validateLocation} from './validation';

// TODO : Add Form Validation. Validate each of the fields.
// TODO : Error handling when the message = ""

const Signup = () => {

  const [password , setPassword] = useState("");
  const [confirmPassword , setConfirmPassword] = useState("")
  const [location, setLocation] = useState("")
  const [email , setEmail] = useState("");
  const [username, setUsername] = useState("")
  const [number , setNumber] = useState("")
  const [name , setName] = useState("")
  const [gender , setGender] = useState("") 
  const [age, setAge] = useState(0) 

  // form validation
  const [emailError , setEmailError] = useState(false)
  const [numError , setNumError] = useState(false)
  const [passError, setPassError] = useState(false)
  const [locationError, setLocationError] = useState(false)

  const [loading, setLoading] = useState<any>(null)
  const [done , setDone] = useState<any>(null);


  const handleSignup = async () => {
        setLoading(true); 

        const eVal = validateEmail(email) // email validation
        const nVal = validatePhoneNumber(number) // phone number validation
        const pVal = validatePassword(password) // password validation
        const lVal = validateLocation(location)

        const locationObject = {
          city : lVal.city,
          state : lVal.state,
          country : lVal.country,
        }

        setEmailError(!eVal.ok)
        setNumError(!nVal.ok)
        setPassError(!pVal.ok)
        setLocationError(!lVal.ok)

        let message = ""

        if (!eVal.ok){
          message += eVal.message + "\n"
        }
        if (!pVal.ok){
          message += pVal.message + "\n"
        }
        if (!nVal.ok){
          message += nVal.message + "\n"
        }
        if (!lVal.ok){
          message += lVal.message + "\n"
        }

        if (!pVal.ok || !eVal.ok || !nVal.ok || !lVal.ok){
          alert(message)
          setLoading(false)
          return
        }
        
        if (pVal.ok){
          if (password !== confirmPassword) {
            alert(`passwords don't match`)
            setPassError(true)
            setLoading(false)
            return;
          }
        }

        const ok = await api.signUp({
          location : locationObject,
          email : email,
          password : password,
          number : number,
          age : age,
          gender : gender,
          name : name,
        });
        setLocation("")
        setEmail("")
        setNumber("")
        setPassword("")
        setEmail("")
        setAge(0)
        setGender("")

        setLoading(false);

        if (!ok){
          alert(`failed to create an account`);
          return;
        }
        
        setDone(true);
        await asyncTimeout(1000);
        setDone(false);

        if (ok){
          router.navigate("/auth/sign-in")
        } else {
          alert(`failed to sign up`)
        }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212"}}>
      <ScrollView style={{ flex: 1, paddingBottom : 100}}
        showsVerticalScrollIndicator={false} 
      >
        <ImageBackground
          source={{
            uri : "https://daily.jstor.org/wp-content/uploads/2017/09/indian_dress_1050x700.jpg"
          }} 
          style={{
            height : 400,
            justifyContent : "center",
            alignItems : "center",
          }}
          imageStyle={{
            opacity : 0.5,
          }}
        >
          <Text style={{
            fontFamily : "Montserrat_500Medium",
            textAlign : "center",
            marginHorizontal : 30,
            color : "white",
            opacity : 0.9,
            fontSize : 22,
          }}>Explore South Asian Beauty and Fashion</Text>
        </ImageBackground>
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
              fontFamily : "Inter_500Medium",
              fontSize : 15,
              color : "white",
            }}>Fill in all the details below to create your account!</Text>
          </View>

          <PrimaryInput 
            label="Name"
            placeholder='Enter your name'
            onChangeText={text => setName(text)} 
          />

          <PrimaryInput 
            label="Age"
            placeholder='Enter your age'
            keyboardType="numeric"
            onChangeText={text => setAge(parseInt(text))} 
          />

          <SelectInput 
            label="Gender"
            placeholder="Pick your gender" 
            data={[{label : "Male" , value : "male"}, {label : "Female" , value : "female"}, {label : "Other" , value : "other"}]}
            onChange={(val : string) => setGender(val[0])}
            multiple={false}
          />

          <View style={{marginVertical : 10}}/>

          <PrimaryInput 
            label="Email *"
            error={emailError}
            placeholder='Enter your email address'
            keyboardType="email-address"
            onChangeText={text => setEmail(text)} 
          />

          <PrimaryInput 
            label="Phone *"
            error={numError}
            placeholder='With country code +92 or +91'
            keyboardType="phone-pad"
            onChangeText={text => setNumber(text)} 
          />

          <PrimaryInput 
            label="Location *"
            error={locationError}
            placeholder='Format like this city, state, country'
            onChangeText={text => setLocation(text)} 
          />

          
          <View style={{marginVertical : 10}}/>

          
          <PasswordInput 
            label="Password"
            error={passError}
            placeholder='Enter a secure password'
            onChangeText={text => setPassword(text)} 
          />

          <PasswordInput 
            label="Confirm Password"
            error={passError}
            placeholder='Enter your password again'
            onChangeText={text => setConfirmPassword(text)} 
          />

          <View style={{marginVertical : 10}}/>

          <PrimaryButton 
            onPress={handleSignup}
            text="Create Account" 
            loading={loading}
            done={done}
          />

          <SecondaryButton 
            onPress={() => router.navigate("/auth/sign-in")}
            text="Have An Account ?" 
          />

          <View style={{paddingVertical : 200}}/>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Signup;
