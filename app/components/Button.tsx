import { Text, TouchableOpacity , StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';
import * as size from "react-native-size-matters"
import AntDesign from '@expo/vector-icons/AntDesign';

export function PrimaryButton(props : any){
  return (
    <TouchableOpacity
        {...props}
        style={[
          styles.primaryButton,
          props.style,
        ]}
        
      >

        {props.loading === true && <ActivityIndicator size="large" color="black"/>}
        {props.done === true && <AntDesign name="check" size={27} color="black" />}

        {(!props.loading && !props.done) && <Text style={[styles.primaryButtonText,props.textStyle]}>{props.text}</Text>}
        {props.children}
      </TouchableOpacity>
  )
}

export function SecondaryButton(props : any){
  return (
    <TouchableOpacity
        {...props}
        style={[
          styles.secondaryButton,
          props.style,
        ]}
        
      >

        {props.loading === true && <ActivityIndicator size="large" color="white"/>}
        {props.done === true && <AntDesign name="check" size={27} color="white" />}

        {(!props.loading && !props.done) && <Text style={[styles.secondaryButtonText,props.textStyle]}>{props.text}</Text>}
        {props.children}
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  primaryButton : {
    paddingVertical: 10,
    paddingHorizontal : 14,
    marginTop : 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex : 0,
    backgroundColor : "white",
  },

  primaryButtonText : { 
    fontSize: 17, 
    color: "black", 
    fontFamily : "Inter_500Medium",
    marginVertical : 3,
  },

  secondaryButtonText : {
    fontFamily : "Inter_400Regular",
    fontSize : 17,
    marginVertical : 3,
    color : "white",
  },


  secondaryButton : {
    paddingVertical: 10,
    paddingHorizontal : size.scale(40),
    marginTop : 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex : 0,

    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 6,

    backgroundColor: '#222222',
  },
})