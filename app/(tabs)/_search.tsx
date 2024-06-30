import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, Pressable, ImageBackground} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import * as size from "react-native-size-matters"
import { Ionicons , Entypo} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const styles2 = StyleSheet.create({
  category : {
    height : size.verticalScale(120),
    margin : size.moderateScale(20),
    borderRadius : size.scale(23),
    paddingVertical : size.moderateScale(10),
    paddingHorizontal : size.moderateScale(33),
  },
   imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',  // Aligns children to the bottom
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    height: size.scale(70),
    width: size.scale(70),
    borderRadius: size.scale(35),
  },

  text: {
    fontSize: size.verticalScale(15),
    textAlign: 'center',
  },
})

function Category(props : any){
  return (
    <Pressable onPress={() => router.navigate(props.route)}
      style={{
        marginHorizontal : size.scale(15),
        marginVertical : size.verticalScale(15),
      }} 
    >
      <ImageBackground source={props.image}
        style={{borderRadius : 8,}}
        imageStyle={{borderRadius : 8}} 
      >
    <LinearGradient style={{
      height : 200,
      padding : 20,
      borderRadius : 8,
    }} colors={["rgba(0,0,0,0.6)", "transparent" , ]}>
      <Text style={{color : "white" , fontSize : size.moderateScale(30) , fontFamily : "Poppins"}}>
        {props.title}
      </Text>
    </LinearGradient>
    </ImageBackground>
    </Pressable>
  )
}

// TODO : Add header
// TODO : Add proper token

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    "Montserrat" : require("../assets/fonts/Montserrat.ttf"),
  });
};



export const Search = (props : any) => {
  const [val, setVal] = useState("")
  const [cross , setCross] = useState(true)

  useEffect(() => {
    if (val === ""){
      setCross(false)
    }
  } , [val])

  return(
    <View 
      style={{
        alignItems: 'center', 
        display : "flex" , 
        flexDirection : "row", 
        width: size.scale(350),
      }}
    >
      <TextInput 
        style={styles.enterText} 
        onChangeText={t => {
          setVal(t)
          setCross(true)
          props.onChange(val);
        }}
        onSubmitEditing={() => props.onSubmit(val)}
        placeholder={props.placeholder}
        value={val}
      />
        <Ionicons size={25} name="search" color="black" style={{position : "absolute", marginLeft : 60,}}/>

        {cross ? 
        
        <Pressable onPress={() => setVal("")} style={{
          position : "absolute", right : 60,
          padding : 10,
        }}><Entypo size={25} name="cross" color="black" /></Pressable> : <></>}
        
    </View>
 
  )
}

const styles = StyleSheet.create({
  enterText: {
    flex : 1,
    height: size.verticalScale(40), // height
    marginHorizontal: size.moderateScale(46), // margin or padding
    marginVertical : size.verticalScale(15),
    paddingLeft : 50,
    fontFamily : "Poppins",
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 2,
    backgroundColor : "#d3d3d3",
    color : "black",
  },

})
