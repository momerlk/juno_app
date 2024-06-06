import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, Pressable} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import Button from '../components/Button';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import List from '@birdwingo/react-native-instagram-stories/src/components/List';
import { TouchableHighlight } from 'react-native-gesture-handler';

// TODO : Add header
// TODO : Add proper token
export default function TabTwoScreen() {
  const [data, setData] = useState<any>([]);
  const [req , setReq] = useState(0);
  fetchFonts();

  useEffect(() => {
    // const fetchData = async () => {
    //   const myHeaders = new Headers();
    //   // TODO : Replace with actual token
    //   let token = null
    //   try {
    //     token = await AsyncStorage.getItem("token")
    //   } catch (e){
    //     alert(`failed to get authentication token! Sign in again`)
    //     router.replace("/sign-in")
    //   }
    //   myHeaders.append("Authorization", `Bearer ${token}`);

    //   const requestOptions = {
    //     method: "GET",
    //     headers: myHeaders,
    //   };

    //   try {
    //     const response = await fetch("http://localhost:3000/user/liked", requestOptions);const result = await response.json();
    //     if(response.status !== 200){
    //       alert(`failed to get liked products. error : ${result.message}`)
    //       return;
    //     }
    //     setData(result);
    //   } catch (error) {
    //     console.log(`Error fetching data: ${error}`);
    //     setData(mockData)
    //     setReq(1);
    //   }
    // };

    // if(req == 0){
    //   fetchData();
    // }
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <ScrollView>
     <Cart />
    </ScrollView>
  );
}
const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};



export function Cart () { 
  const [count, setCount] = useState(0);
  const onPress = () => setCount(count + 1);
  return(
  <View style={{display: 'flex', 
    flexDirection: 'column',
    borderWidth: 1,
    height: 200,
    borderColor: '#D3D3D3',
    borderStyle: 'solid',
    shadowColor: '#D3D3D3',
    shadowOffset:{
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.28,
    shadowRadius: 16.00,
    elevation: 24,
    borderRadius: 20,
    paddingTop: 10,
    }}>
  <>
  <Text style={{fontSize: 25, fontFamily: "Montserrat", marginLeft: 100, fontWeight: "heavy"}}>Sana Safinaz Unstitched Dress in Purple</Text>
  </>
  <Text style={{fontFamily: "Montserrat", left: 100, top: 20
  }}>Quantity: 1</Text>
  <>
  <Text style={{fontFamily: "Montserrat", left: 100, top: 25
  }}>Size:</Text>
  </>
    <TouchableHighlight onPress={onPress}>
          <Text>+</Text>
    </TouchableHighlight>
  </View>)
}






const mockData = [{
  "brand_title": "Afrozeh",
  "brand_picture" : "exampleimage.com/pic.jpg",
  "brand_id": "Test",
  "total" : "PKR 27,000",
  "products" : [
    {
      "title" : "test",
      "handle" : "test",
      "image_url" : ""
    }
  ],
}]


