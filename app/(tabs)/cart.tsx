import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, FlatList, Image, View, Text, ScrollView, Pressable, Button} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as size from "react-native-size-matters";
import {Logo} from "./_common"

import * as api from "./api"

function toTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    str = str.replaceAll("_" , " ");
    const words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
      try {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      } catch(e){
        return ""
      }
    }

    return words.join(" "); 
  }

  function shortTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    
    const strTitle = toTitle(str);
    str = (strTitle == "") ? str : strTitle;

    const words = str.split(" ");
    if(words.length < 3){
      return str;
    }

    let three_words = [];

    for(let i = 0;i < 3;i++){
      if (words[i][0] === "("){
        continue;
      }
      three_words.push(words[i])
    }
    return three_words.join(" ") + " ..." 
  }




export default function CartPage() {
  const [data, setData] = useState<any>(mockData);
  const [req , setReq] = useState(0);
  const [loading , setLoading] = useState(false);
  fetchFonts();
  
  useEffect(() => {
    (async() => {
      const cart = await api.getCart();
      if(cart !== null){
        setData(cart)
      }
    })()
  }, [])

  useEffect(() => {
    
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <View style={{flex : 1, backgroundColor : "#121212"}}>
      <Logo />
      <View style={{marginTop : 100}}></View>
     <FlatList
          contentContainerStyle={{}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={(item) => item.vendor}
          renderItem={({ item }) => <Cart item={item}/>}
          // TODO : Test this fully
          onRefresh={async () => {
            setLoading(true);
            const cart = await api.getCart();
            if(cart !== null){
              setData(cart)
            }
            setLoading(false);
          }}
          refreshing={loading}
        />
    </View>
  );
}
const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    "Montserrat" : require("../assets/fonts/Montserrat.ttf"),
  });
};



export function Cart (props : any) { 
  const vendor_data = props.item;
  // TODO : replace with actual shopify permalink
  const [uri, setUri] = useState("https://bonanzasatrangi.com/46417313955/checkouts/531f95efefddbac87d62de1968606d6c?note=This+was+order+was+placed+with+the+help+of+juno.&ref=JUNO")

  // TODO : add delete and update functions and connect them to server

  return(
    <View style={{marginTop : 40 , paddingBottom : 50}}>
      
        <Text style={{marginTop : 10, color : "white", fontSize : 24, marginLeft : 14, fontFamily : "Poppins", }}>
          {toTitle(vendor_data.vendor)}</Text>
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4, flexGrow : 1}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={vendor_data.items}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
        />
        <Pressable
        style={[
          {
            paddingBottom: 16,
            paddingVertical: 10,
            marginHorizontal : 14,
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center'
          },
          { backgroundColor: "white" },
        ]}
        onPress={() => {
          router.navigate({
            pathname : "/browser",
            params : {
              uri : uri,
            }
          })
        }}
      >
        <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }}>Checkout</Text>
      </Pressable>
      </View>
  )
}


function Card(props : any){
  // TODO : make this navigate to /details on press

  // TODO : add proper quantity connected to backend
  const [quantity , setQuantity] = useState(1);


  return (
    <View style={{display : "flex", flexDirection : "row"}}>
      <Image
              style={{
                height : size.verticalScale(200), 
                width : size.verticalScale(120),
                marginHorizontal : size.moderateScale(8),
                marginVertical : size.verticalScale(5),
                borderRadius : 8,
              }}
              source={{ uri: props.item.image_url }}
            />
      <View style={{display : "flex" , flexDirection : "column"}}>
        <View style={{marginTop : size.verticalScale(20),}}>
          <Text style={{
            color : "white",
            marginHorizontal : 10,
            fontSize : 16,
            fontFamily : "Poppins",
            width : size.scale(140),
            }}>
              {props.item.title}
            </Text> 

            <Text style={{
            color : "gray",
            marginHorizontal : 10,
            marginVertical : 6,
            fontSize : 16,
            fontFamily : "Poppins",
            width : size.scale(140),
            }}>
              By {toTitle(props.item.vendor)}
            </Text> 
          <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 10,
          }}>
            
            <Text style={{
              fontSize: 15, fontFamily: "Poppins",
              color : "white"
            }}>Rs. {props.item.price}</Text>
          </View>
        </View>

        <View style={{marginTop : size.verticalScale(60),marginHorizontal : 10, display : "flex" , flexDirection : "row"}}>
          <Pressable style={{width : 40, height : 40, borderRadius : 6}}
            onPress={() => {
              if (quantity < 1){
                return
              }
              if (quantity === 1){
                return
              }
              setQuantity(quantity - 1)
            }}
          >
            <Text style={{color : "gray", fontSize : 30, alignSelf : "center"}}>-</Text>
          </Pressable>
          <Text style={{marginHorizontal : 10, color : "white", fontSize : 23, alignSelf : "center"}}>{quantity}</Text>
          <Pressable style={{width : 40, height : 40, borderRadius : 6}}
            onPress={() => {
              if (quantity > 8){
                return
              }
              setQuantity(quantity + 1)
            }} 
          >
            <Text style={{color : "gray", fontSize : 30, alignSelf : "center"}}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}



const mockData = [{
  "product_id": "90d3a4e5-9cd2-4183-bb73-0a532281ce31",
  "product_url": "https://www.afrozeh.com/products/serenova",
  "shopify_id": "8212329103594",
  "handle": "serenova",
  "title": "Serenova",
  "vendor": "afrozeh",
  "vendor_title": "Afrozeh",
  "category": "",
  "product_type": "",
  "image_url": "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09441.jpg?v=1700654661",
  "images": [
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09441.jpg?v=1700654661",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09455.jpg?v=1700654660",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09458.jpg?v=1700654661",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09517.jpg?v=1700654661",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09550.jpg?v=1700654661",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09582.jpg?v=1700654661",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09605.jpg?v=1700654660",
    "https://cdn.shopify.com/s/files/1/0052/2030/2897/files/AIZ09649.jpg?v=1700654662"
  ],
  "description": "Serenova showcases sheer stitched three-piece perfection. It’s an open-cut shirt in a green hue with delicate, monotone floral embroidery on plain khadar fabric that exudes timeless charm. Paired with an embroidered border shawl, complemented by the perfect touch of laces on each side, and plain pants, that add a touch of opulence and luxury.\nNote: Pret orders will dispatch by 5th of December",
  "price": 12720,
  "compare_price": 15900,
  "discount": 19,
  "currency": "PKR",
  "variants": [
    {
      "id": "44260308812010",
      "price": 12720,
      "title": "Stitched / S",
      "compare_price": 15900,
      "option1": "Stitched",
      "option2": "S",
      "option3": ""
    },
    {
      "id": "44305551884522",
      "price": 12720,
      "title": "Stitched / M",
      "compare_price": 15900,
      "option1": "Stitched",
      "option2": "M",
      "option3": ""
    },
    {
      "id": "44305551917290",
      "price": 12720,
      "title": "Stitched / L",
      "compare_price": 15900,
      "option1": "Stitched",
      "option2": "L",
      "option3": ""
    }
  ],
  "options": [
    {
      "name": "Type",
      "position": 1,
      "values": [
        "Stitched"
      ]
    },
    {
      "name": "Size",
      "position": 2,
      "values": [
        "S",
        "M",
        "L"
      ]
    }
  ],
  "tags": [
    "custom_flow",
    "ELARA LUXURY PRET",
    "Hide_Custom_Flow",
    "rtw-custom-flow",
    "Sale-1-July",
    "Serenova",
    "show_fabric_color_metafield"
  ],
  "available": true
}]


