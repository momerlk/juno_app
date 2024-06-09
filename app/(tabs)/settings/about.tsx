import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Pressable,
  Switch,
  Image,
} from 'react-native';
import {router} from "expo-router"
import { 
  FontAwesome, FontAwesome6, MaterialIcons, Feather,
  Ionicons,
} from '@expo/vector-icons';


export default function Example() {
  const [form, setForm] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
        <Image source={require("../juno_icon.png")} 
            style={{height : 100, width : 100, resizeMode : "cover", alignSelf : "center", marginTop : 10}} />

        <Text style={{fontSize : 25, color : "white", alignSelf : "center", fontFamily : "Poppins"}}>
            {"Masthead"}
        </Text> 


        <Person 
            name="O.M"
            description="Jack of all trades"
        />
        <Person 
            name="A.N"
            description="Yapper-in-chief"
        />
        <Person 
            name="A.B.R"
            description="Nerd Supreme"
        />
      
    </ScrollView>
  );
}


function Person(props : any){
  return (
    <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal : 20,
                  paddingVertical : 10,
                }}
    >

        <View style={{display : "flex", flexDirection : "row",marginTop: 7,}}>
        <Text style={{
          marginLeft : 15,
          fontSize: 20, fontFamily: "Poppins",
          color : "white"
        }}>{props.name}</Text>
        </View> 

        <Text style={{
          fontSize: 18, marginVertical: 5,
          marginTop : 10,
          color : "gray",
          fontFamily : "Poppins",
        }}>{props.description}</Text>
      </View> 
  )
}