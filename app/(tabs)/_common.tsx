import { router } from "expo-router";
import React from "react"
import {Text , Image , Pressable , View, ActivityIndicator, TouchableOpacity} from "react-native"
import {Ionicons} from "@expo/vector-icons"

import * as size from "react-native-size-matters"

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
    <Pressable onPress={() => router.back()} style={{
      display : "flex" , flexDirection : "row", marginBottom : 7, marginTop : 15 , paddingTop : 20
      }}>
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

export function Loading(){
  return (
    <View style={{flex : 1,backgroundColor : "black", paddingTop : 40, paddingLeft : 20}}>
            
            <ActivityIndicator style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -50 }, { translateY: -50 }],
            }} size={60} color="white"/>
        </View>
  )
}

export function toTitle(str : string) : string {
  if (str === undefined){
    return ""
  }
  str = str.replaceAll("'" , "")
  str = str.replaceAll("_" , " ");
  str = str.toLowerCase()
  const words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    try {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    } catch(e){
      return ""
    }
  }

  return words.join(" "); 
}

export function shortTitle(str : string) : string {
  if (str === undefined){
    return ""
  }
  
  const strTitle = toTitle(str);
  str = (strTitle == "") ? str : strTitle;

  const words = str.split(" ");
  if(words.length < 3){
    return str;
  }

  let three_words = [];

  for(let i = 0;i < 3;i++){
    if (words[i][0] === "("){
      continue;
    }
    three_words.push(words[i])
  }
  let res = three_words.join(" ") + " ..." 
  if (res.length > 19){
    res = res.substring(0,18) + " ...";
  }
  return res
}

export function fmtPrice(priceN : number){
  const price = priceN.toString();
  let l = price.length;
  let pos = (l) - 3;
  if (pos > 0) {
    const firstPart = price.slice(0, pos);
    const secondPart = price.slice(pos);

    // Concatenate the first part, substring, and second part
    const newString = firstPart + "," + secondPart;
    return newString;
  } else {
    return price
  }
}

export function PrimaryButton(props : any){
  return (
    <TouchableOpacity
        {...props}
        style={[
          {
            paddingVertical: 10,
            paddingHorizontal : 14,
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex : 0,
          },
          { backgroundColor: "white" },
          props.style,
        ]}
        
      >
        <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }}>{props.text}</Text>
        {props.children}
      </TouchableOpacity>
  )
}

export function SecondaryButton(props : any){
  return (
    <TouchableOpacity
        {...props}
        style={[
          {
            paddingVertical: 10,
            paddingHorizontal : size.scale(40),
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex : 0,

            borderColor : "white",
            borderWidth : 2,
          },
          { backgroundColor: "black" },
          props.style,
        ]}
        
      >
        <Text style={{ fontSize: 18, color: "white", fontFamily : "Poppins" }}>{props.text}</Text>
        {props.children}
      </TouchableOpacity>
  )
}