import { Text, TouchableOpacity , StyleSheet } from 'react-native';
import React from 'react';
import * as size from "react-native-size-matters"

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
        <Text style={[{ fontSize: 18, color: "black", fontFamily : "Poppins_400Regular" }, props.textStyle]}>{props.text}</Text>
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
        <Text style={[{ fontSize: 18, color: "white", fontFamily : "Poppins_400Regular" },props.textStyle]}>{props.text}</Text>
        {props.children}
      </TouchableOpacity>
  )
}