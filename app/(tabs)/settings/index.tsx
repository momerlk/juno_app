import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Pressable,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import {router} from "expo-router"
import { 
  FontAwesome, FontAwesome6, MaterialIcons, Feather,
  Ionicons,
} from '@expo/vector-icons';
import * as size from "react-native-size-matters"
import {Logo} from "../../_common"

import * as api from "../../api"

export default function SettingsPage() {
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
  // TODO : Get User details from backend
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
     <Logo />
      <View style={{marginTop : 100}}></View>

      <Text style={{fontSize : 25, color : "white", alignSelf : "center", fontFamily : "Montserrat", fontWeight :"bold"}}>
        {data.name}
      </Text> 
      <Text style={{fontSize : 18, color : "gray", alignSelf : "center", marginTop : 20, fontFamily : "Poppins"}}>
        {data.email}
      </Text>
      <Text style={{fontSize : 18, color : "gray", alignSelf : "center", marginBottom : 20, fontFamily : "Poppins"}}>
        {data.number}
      </Text>

      <Action 
        icon={(<FontAwesome name="user" size={23} color="white" style={{marginTop : 4}}/>)}
        name="Profile Details"
        route="/settings/profile"
        replace={false}
      />
      <Action 
        icon={(<FontAwesome6 name="heart" size={23} color="#d3d3d3" style={{marginTop : 4}}/>)}
        name="Liked"
        route="/liked"
        replace={false}
      />

      {/* <Action 
        icon={(<MaterialIcons name="bookmark-border" size={23} color="#d3d3d3" style={{marginTop : 4}}/>)}
        name="Orders and Purchases"
        route="/settings/orders"
        replace={false}
      /> */}

      <Action 
        icon={(<MaterialIcons name="help-center" size={26} color="#d3d3d3" style={{marginTop : 4}}/>)}
        name="Help"
        route="/settings/help"
        replace={false}
      />
      <Action 
        icon={(<Feather name="info" size={23} color="#d3d3d3" style={{marginTop : 4}}/>)}
        name="About"
        route="/settings/about"
        replace={false}
      />
      <Action 
        icon={(<Feather name="info" size={23} color="#d3d3d3" style={{marginTop : 4}}/>)}
        name="Log Out"
        route="/sign-in"
        replace={true}
      />
    </ScrollView>
  );
}

function Action(props : any){
  return (
    <TouchableOpacity style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal : 20,
                  paddingVertical : 10,
                  borderTopWidth : StyleSheet.hairlineWidth,
                  borderBottomWidth : StyleSheet.hairlineWidth,
                  borderColor : "#2D2D2D",
                }}
      onPress={() => {
        if (props.replace === false){
          router.navigate(props.route)
        } else {
          router.replace(props.route)
        }
      }}             
    >

        <View style={{display : "flex", flexDirection : "row",marginTop: 7,}}>
        {props.icon}
        <Text style={{
          marginLeft : 15,
          fontSize: 20, fontFamily: "Poppins",
          color : "#d3d3d3"
        }}>{props.name}</Text>
        </View> 

        <Text style={{
          fontSize: 25, marginVertical: 5,
          color : "gray",
          fontFamily : "Poppins",
        }}>{">"}</Text>
      </TouchableOpacity> 
  )
}

const styles = StyleSheet.create({
  
});