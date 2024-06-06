import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, Pressable} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import Button from '../components/Button';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO : Add header
// TODO : Add proper token

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};


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
    //     const response = await fetch("http://192.168.18.16:3000/user/liked", requestOptions);const result = await response.json();
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
     <Checkout />
    </ScrollView>
  );
}

const styles = StyleSheet.create({

})

const addedToCart = () => {
  <View>
  <Text>Hello</Text>

  </View>
}

function Checkout(){
  return (
    <View>

    </View>
  )
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