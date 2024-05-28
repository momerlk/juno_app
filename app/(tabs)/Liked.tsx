import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView } from 'react-native';
import * as Font from "expo-font";

// TODO : Add header

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};


export default function TabTwoScreen() {
  const [data, setData] = useState<any>([]);
  fetchFonts();

  useEffect(() => {
    const fetchData = async () => {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjRmODY0NzNlY2QwZTQ2MWE2N2NiYTQiLCJpYXQiOjE3MTY5MjcxNTEsImV4cCI6MTcxNjkzMDc1MX0.jRqqPkQtdFBrMRz1lu0znNZM8rBRzUu5Q9s29eC0DvM");

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      try {
        const response = await fetch("http://localhost:3000/user/liked", requestOptions);
        const result = await response.json();
        setData(result);
      } catch (error) {
        alert(`Error fetching data: ${error}`);
        setData(mockData)
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <ScrollView>
      {data.map((product: any, index: number) => (
        <LikedCard
          key={index}
          title={product.title}
          price={`Rs. ${product.price}`}
          url={product.image_url}
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
  </div>
}


const mockData = [{
  "_id": {
    "$oid": "6650985355cb0cafd49c14c2"
  },
  "product_id": "cc0143d6-acfd-442f-83c4-658f9567b2d2",
  "product_url": "https://www.afrozeh.com/products/mahjabeen-1",
  "shopify_id": {
    "$numberLong": "8002372829418"
  },
  "handle": "mahjabeen-1",
  "title": "MAHJABEEN-22",
  "vendor": "afrozeh",
  "category": "",
  "image_url": "https://cdn.shopify.com/s/files/1/0052/2030/2897/products/5.jpg?v=1668433218",
  "description": "net embellished embroidered front back body mnet embellished embroidered front back panel pcsnet embroidered sleeve metersnet embroidered sleeve border metersraw silk embroidered sleeve border metersraw silk embroidered front back border metersnet embroidered dupatta side border metersnet embroidered dupatta meter",
  "price": "29900",
  "currency": "PKR",
  "options": [
    {
      "name": "Type",
      "position": 1,
      "values": [
        "Unstitched",
        "Stitched"
      ]
    }
  ],
  "tags": [],
  "available": true
}]