import { router } from "expo-router";
import React from "react"
import {Text , Image , Pressable , View} from "react-native"
import {Ionicons} from "@expo/vector-icons"

export function Logo(){
  const topMargin = 42;
    return (
    <>
        <Image  source={require("../assets/juno_text.png")} style={{
          position : "absolute",
          marginTop : topMargin,
          left : 20,
          height : 60, 
          width : 100, 
          resizeMode : "cover", 
          alignSelf : "center", 
        }} 
          />

      

    </>
    )
}

interface BackProps {
  text : string;
}
export function Back(props : BackProps ){
  return (
    <>
    <Pressable onPress={() => router.back()} style={{display : "flex" , flexDirection : "row", marginVertical : 23 , paddingTop : 15}}>
      <View  
        style={{
          left : 10,
          top : 10,
          marginBottom : 10,
          }} >
          <Ionicons name="arrow-back" size={32} color="white"/>
      </View>
      <Text 
        style={{
          color : "white", 
          fontFamily : "Poppins", 
          fontSize : 22 , 
          marginLeft : 20,
          marginTop : 10,
        }} >
          {props.text}
      </Text>
    </Pressable>
    </>
  )
}