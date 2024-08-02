import React, { useState, useEffect } from 'react';
import { TextInput, View, Text, ScrollView, Pressable, TouchableOpacity} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as size from "react-native-size-matters";
import { BACKGROUND_COLOR } from '@birdwingo/react-native-instagram-stories/src/core/constants';
import { EvilIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign, Feather } from '@expo/vector-icons';

import {Back, PrimaryButton, SecondaryButton, Loading} from "../../components/_common"

import * as api from "../../backend/api"



export default function ProfilePage(){

  const [data , setData] = useState<any>({
      "id": "",
      "avatar": "",
      "age": 0,
      "gender": "0",
      "name": "None",
      "phone_number": "0",
      "username": "juno",
      "email": "0",
      "password": ""
  })
  const [loading , setLoading] = useState(true);

  const [username , setUsername] = useState("")

  // TODO : connect to backend
  const updateData = (fieldName : string, value : any) => {
    data.username = value
    setData(data);
  }

  useEffect(() => {
      (async () => {
      const resp = await api.getDetails();
      setData(resp);
      setLoading(false);
      })()
  } , [])

  if(loading === true){
    return <Loading />
  }

  return (
      <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
        <Back text="Settings"/>

        <Text style={{
          color : "white" , 
          fontFamily : "Poppins_400Regular", 
          fontWeight : "bold",
          fontSize: 25,
          marginHorizontal : 30,
          marginVertical : 30,
        }}>Edit Your Information</Text>
        

        <EditableField 
          name="Username" 
          value={data.username} 
          editable={true}

          onChange={(v:string) => {}} 
          onSubmit={async (v:string) => {
            // TODO : add validation from backend
            setUsername(v);
          }}
        />
          
        <EditableField 
          name="Email" 
          value={data.email} 
          editable={false}
          onChange={(v:string) => {}} 
          onSubmit={(v:string) => updateData("email" , v)}
        />

        <EditableField 
          name="Phone" 
          value={data.phone_number} 
          editable={false}
          onChange={(v:string) => {}} 
          onSubmit={(v:string) => updateData("number" , v)}
        />

      </ScrollView>
  )
}


interface EditableProps {
  name : string;
  value : string;

  onChange   : Function;
  onSubmit : Function;

  editable : boolean;
}
function EditableField(props : EditableProps){
  const [editing , setEditing] = useState(false);
  const [value , setValue] = useState("");
  
  return (
    <View style={{
      backgroundColor : "black",
      paddingVertical : 20,
      paddingHorizontal : 25,
      borderRadius : 20,
      marginHorizontal : 20,
      marginVertical : 15,
    }}>


      <View style={{
        display : "flex" , 
        flexDirection : "row" , 
        justifyContent : "space-between" , 
        
      }}>

        <Text style={{
            fontSize : 20, 
            color : "white", 
            alignSelf : "center", 
            fontFamily : "Poppins_400Regular", 
          }}>
          {props.name}
        </Text>


        <View style={{display : "flex" , flexDirection : "row"}}>

          <Text style={{
              fontSize : 17, 
              color : "white", 
              alignSelf : "center", 
              fontFamily : "Poppins_400Regular", 
              fontWeight :"semibold",
              marginHorizontal : 20,
            }}>
            {props.value.length > 10 ? props.value.substring(0,9) + " ..." : props.value}
          </Text>

          <TouchableOpacity onPress={() => {
            if (props.editable === false){
              alert(`can't edit this field`)
            }
            editing ? setEditing(false) : setEditing(true)
          }}>
            <Feather size={25} name="edit-3" color="white"/>
          </TouchableOpacity>

        </View>

      </View>


    {editing && props.editable ?
      <View style={{flex : 1, display : "flex", flexDirection : "column"}}>
        
        <Text style={{
            fontSize : 19, 
            color : "white", 
            fontFamily : "Poppins_400Regular", 
            fontWeight :"semibold",
            marginVertical : 20,
          }}>
          {props.value}
        </Text>

        <TextInput 
          style={{
            borderStyle : "solid",
            borderWidth : 2,
            borderColor : "white",

            color : "white",

            marginBottom : 10,
            paddingVertical : 10,
            paddingHorizontal : 10,
            fontSize : 20,
          }}
          value={value}
          onChangeText={v => {setValue(v); props.onChange(v) }}
          placeholder={`Edit ${props.name}`}
          placeholderTextColor={"gray"}
        />

        <View style={{display : "flex" , flexDirection:"row" , flex : 1}}>

          <PrimaryButton text="Confirm" 
            style={{
              paddingHorizontal : size.scale(25)
            }}
            onPress={async () => {
              await props.onSubmit(value)
              setValue(""); 
              setEditing(false);  
            }}
          />
          <SecondaryButton 
            text="Clear" 
            style={{marginHorizontal : 20, paddingHorizontal : size.scale(30)}}
            onPress={() => {setValue("");setEditing(false)}}
          />

        </View>

      </View> 
      : <></>
    }


    </View>
  )
}