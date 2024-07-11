import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, FlatList, Image, View, Text, ScrollView, Pressable, TouchableOpacity} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as size from "react-native-size-matters";
import { BACKGROUND_COLOR } from '@birdwingo/react-native-instagram-stories/src/core/constants';
import { EvilIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign, Feather } from '@expo/vector-icons';

import {Back} from "../_common"

import * as api from "../api"

interface EditableProps {
  name : string;
  value : string;
  onChange   : Function;
}
function EditableField(props : EditableProps){
  return (
    <View style={{
      display : "flex" , 
      flexDirection : "row" , 
      justifyContent : "space-between" , 
      marginHorizontal : 20,
      marginVertical : 20,
    }}>
      <Text style={{
          fontSize : 23, 
          color : "white", 
          alignSelf : "center", 
          fontFamily : "Montserrat", 
        }}>
        {props.name}
      </Text>
      <View style={{display : "flex" , flexDirection : "row"}}>
        <Text style={{
            fontSize : 20, 
            color : "white", 
            alignSelf : "center", 
            fontFamily : "Montserrat", 
            fontWeight :"semibold",
            marginHorizontal : 20,
          }}>
          {props.value.length > 10 ? props.value.substring(0,9) + " ..." : props.value}
        </Text>

        <TouchableOpacity onPress={() => alert(`editing`)}>
          <Feather size={25} name="edit-3" color="white"/>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function ProfilePage(){
    const [data , setData] = useState({
        id : "",
        avatar: "",
        name: "",
        number: "",
        username: "",
        email: "",
        password: ""
    })
    useEffect(() => {
        (async () => {
        const resp = await api.getDetails();
        setData(resp);
        })()
    } , [])
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
          <Back text="Settings"/>
          <View style={{marginTop : 50}}></View>

          <EditableField name="Username" value={"omeralimalik"} onChange={() => {}}/>
            
          <EditableField name="Email" value={"omeralimalik96@gmail.com"} onChange={() => {}}/>

          <EditableField name="Phone" value={"+92 300 0856955"} onChange={() => {}}/>

        </ScrollView>
    )
}