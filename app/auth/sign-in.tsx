import { View, Text, Image, Pressable, ScrollView, TextInput } from 'react-native';
import React, { useState, useEffect} from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import * as api from "../backend/api"
import { PrimaryButton, SecondaryButton } from '../components/button';
import { fetchFonts } from '../backend/util';
import { PrimaryInput, PasswordInput} from '../components/input';
import { useSession } from '../backend/ctx';
import { asyncTimeout } from '../components/_common';


// TODO : Error handling when message = ""

const Login = () => {
  const { signIn } = useSession();
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  // TODO : phone number or email
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")

  const [loading, setLoading] = useState<any>(null)
  const [done , setDone] = useState<any>(null);

  const handleLogin = async () => {
        // e.preventDefault(); 
        setLoading(true);  
        const ok = await signIn(email, password);
        setEmail('')
        setPassword('')
        setLoading(false);

        if (!ok){
          alert(`failed to sign in`);
          return;
        }
        
        setDone(true);
        await asyncTimeout(1000);
        setDone(false);

        if(ok){
          router.replace("/")
        }
    };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212"}}>
      <ScrollView style={{ flex: 1, paddingBottom : 100}}
        showsVerticalScrollIndicator={false} 
      >
        
        <View style={{marginHorizontal : 22}}>
          <View style={{ marginVertical: 22 }}>
            <Text style={{
              fontSize: 22,
              fontFamily : "Inter_500Medium",
              marginVertical: 12,
              color: "white"
            }}>
              Sign In
            </Text>

            <Text style={{
              fontFamily : "Inter_500Medium",
              fontSize : 15,
              color : "white",
            }}>Fill in all the details below to sign in</Text>
          </View>



          <PrimaryInput 
            label="Email *"
            placeholder='Enter your email'
            keyboardType="email-address"
            onChangeText={text => setEmail(text)} 
          />

          
          <PasswordInput 
            label="Password *"
            placeholder='Enter your password'
            onChangeText={text => setPassword(text)} 
          />


          <PrimaryButton 
            onPress={handleLogin}
            text="Sign In"
            loading={loading}
            done={done} 
          />

          <SecondaryButton 
            onPress={() => router.navigate("/auth/sign-up")}
            text="Don't Have An Account ?" 
          />

          <View style={{paddingVertical : 200}}/>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Login;
