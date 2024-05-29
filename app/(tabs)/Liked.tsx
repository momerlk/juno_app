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
    const fetchData = async () => {
      const myHeaders = new Headers();
      // TODO : Replace with actual token
      let token = null
      try {
        token = await AsyncStorage.getItem("token")
      } catch (e){
        alert(`failed to get authentication token! Sign in again`)
        router.replace("/sign-in")
      }
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      try {
        const response = await fetch("http://192.168.18.16:3000/user/liked", requestOptions);const result = await response.json();
        if(response.status !== 200){
          alert(`failed to get liked products. error : ${result.message}`)
          return;
        }
        setData(result);
      } catch (error) {
        console.log(`Error fetching data: ${error}`);
        setData(mockData)
        setReq(1);
      }
    };

    if(req == 0){
      fetchData();
    }
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <ScrollView>
      {data.map((product: any, index: number) => (
        <LikedCard
          key={index}
          title={product.title}
          price={`Rs. ${product.price}`}
          url={product.image_url}
          onPress={() => {
            router.navigate({
                  pathname : "/details",
                  params : product,
                })}
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  likedContainer: {
    display: 'flex', 
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'gray',
    marginHorizontal: 1500,
    padding: 15,
    borderStyle: 'solid',
    shadowColor: "#000",
    shadowOffset:{
	    width: 0,
	    height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 24,
  },
  likedImageBrand:{
    fontFamily: "Montserrat",
    fontSize: 25,
    marginRight: 10,
    },
  likedImagePrice:{
    fontFamily: "Montserrat",
    fontSize: 20,
    color: 'gray',   
    marginRight: 150,
 
  },
  likedImage:{
    width: 360,
    height: 205,  
    borderRadius: 20,
    marginVertical: 50,
    justifyContent: 'center',
    resizeMode : "cover"
  }

});

function LikedCard(props : any){
  return <div style={styles.likedContainer}>
    <Image source={{uri: props.url}} style={styles.likedImage}/>
    <Text style={styles.likedImageBrand}> {props.title} </Text>
    <Text style={styles.likedImagePrice} > {props.price} </Text>
    <Button 
      onPress={props.onPress} 
      title="View Details"
      style={{
        width : scale(140) , 
        height : verticalScale(42) , 
        marginVertical : moderateScale(20)
      }}
      filled={true}
    ></Button>
  </div>
}


const mockData = [{
  "product_id": "",
  "product_url": "",
  "handle": "",
  "title": "Nothing here !",
  "vendor": "",
  "category": "",
  "image_url": "",
  "description": "",
  "price": "",
  "currency": "PKR",
}]