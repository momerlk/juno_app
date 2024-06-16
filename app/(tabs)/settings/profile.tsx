import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, FlatList, Image, View, Text, ScrollView, Pressable, Button} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as size from "react-native-size-matters";
import { BACKGROUND_COLOR } from '@birdwingo/react-native-instagram-stories/src/core/constants';
import { EvilIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

function UsernameCard(props: any){
return(
  <View style={{backgroundColor: '#3b3b3b', 
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  height: 100,
  width: 300,
  left: 25,
  borderBottomColor: 'white'
  }}>
    <Text style={{fontFamily: 'Montserrat', color: 'white', fontSize: 20, left: 15, top: 10,     textDecorationLine: 'underline',
}}>Username</Text>
    <Text style={{color: 'white', fontSize: 32, left: 15, top: 8,  
    }}>{props.username}</Text> 
    <AntDesign name="arrowright" size={40} color="white" style={{left: 230, top: -40}}/>
    </View>
)}

function Password(props: any){
  return(
    <View style={{backgroundColor: '#3b3b3b', 
    height: 100,
    width: 300,
    left: 25,
    top: 0.5,
    borderBottomColor: 'white',
    borderTopColor: 'white'
    }}>
      <Text style={{fontFamily: 'Montserrat', color: 'white', fontSize: 20, left: 15, top: 10,     textDecorationLine: 'underline',
  }}>Password</Text>
      <Text style={{color: 'white', fontSize: 60, left: 17, top: -8,  
      }}>{props.password}</Text> 
      <AntDesign name="arrowright" size={40} color="white" style={{left: 230, top: -80}}/>
      </View>
  )}
function Gender(props: any){
  return(
      <View style={{backgroundColor: '#3b3b3b', 
      height: 100,
      width: 300,
      left: 25,
      top: 1.5,
      borderBottomColor: 'white',
      borderTopColor: 'white'
      }}>
        <Text style={{fontFamily: 'Montserrat', color: 'white', fontSize: 20, left: 15, top: 10,     textDecorationLine: 'underline',
    }}>Gender</Text>
        <Text style={{color: 'white', fontSize: 32, left: 17, top: 15,  
        }}>{props.gender}</Text> 
        <AntDesign name="arrowright" size={40} color="white" style={{left: 230, top: -40}}/>
        </View>
)}

function PhoneNumber(props: any){
  return(
      <View style={{backgroundColor: '#3b3b3b', 
      height: 100,
      width: 300,
      left: 25,
      top: 1.5,
      borderBottomColor: 'white',
      borderTopColor: 'white'
      }}>
        <Text style={{fontFamily: 'Montserrat', color: 'white', fontSize: 20, left: 15, top: 10,     textDecorationLine: 'underline',
    }}>Gender</Text>
        <Text style={{color: 'white', fontSize: 32, left: 17, top: 15,  
        }}>{props.gender}</Text> 
        <AntDesign name="arrowright" size={40} color="white" style={{left: 230, top: -40}}/>
        </View>
)}
  

export default function
 Root(props : any){ return ( <View> <UsernameCard username="Amr Nazir " /> <Password password="⋅⋅⋅⋅⋅⋅⋅⋅"/> <Gender gender="Male"/></View> ) }
