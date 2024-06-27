import { LinearGradient } from "expo-linear-gradient";
import React , {useRef, useState, useEffect} from "react"
import {
  ScrollView , View , Text, StyleSheet, Image, ImageBackground,
  FlatList,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import * as size from "react-native-size-matters";
import * as Font from "expo-font";

import {Feather, Ionicons} from "@expo/vector-icons"



import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";




// TODO : Add backend data gettting logic
// TODO : Add save progress logic

const item = {
  "product_id": "ef380375-0766-4476-9636-3312908c7b7a",
  "product_url": "https://www.mariab.pk/products/mb-ea24-83-black",
  "shopify_id": {
    "$numberLong": "8133789122726"
  },
  "handle": "mb-ea24-83-black",
  "title": "Printed Arabic Lawn Co Ord Set | Mb Ea24 83",
  "vendor": "maria_b",
  "vendor_title": "Maria B",
  "category": "",
  "product_type": "M.Basics Casuals",
  "image_url": "https://cdn.shopify.com/s/files/1/0620/8788/9062/files/MB-EA24-83Black_fbe0ab6d-d366-4ea5-bbfe-647052531500.jpg?v=1716022716",
  "description": "TopButton Down Loose Fit TopPrinted Front & BackColor: BlackFabric: Arabic LawnTrousersPrinted Dhaka TrousersElasticated WaistbandColor: BlackFabric: Arabic lawnModel is wearing size xsNote: Only Dry Clean",
  "price": "5990",
  "currency": "PKR",
  "options": [
    {
      "name": "Size",
      "position": 1,
      "values": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ]
    },
    {
      "name": "Color",
      "position": 2,
      "values": [
        "Black"
      ]
    }
  ],
  "tags": [
    "14-May-24",
    "_label_New",
    "dhlcode:6104 1900",
    "dhldes:Women Casual Shirt",
    "Item_Tax_Rate:15",
    "M.Basics",
    "M.Basics Casuals",
    "M.Basics New Arrivals",
    "M.Basics Ready to Wear",
    "M.Basics-Shirts",
    "Printed",
    "Shirts",
    "women-size-guide"
  ],
  "available": true
}

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
    
function Card(props : any){
  // TODO : Load this specific item in feed
  const height = 350;
  const width = 200;
  const textHeight = 80;
  return (
    <Pressable onPress={() => router.navigate("/(tabs)/feed")}>
      <ImageBackground
              style={{
                height : size.verticalScale(height), 
                minWidth : size.verticalScale(width),
                marginHorizontal : size.moderateScale(3),
                marginVertical : size.verticalScale(5),
              }}
              imageStyle={{
                borderRadius : 8,
              }}
              source={{ uri: props.item.image_url }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.7)"]} style={{
                marginTop : size.verticalScale(height - textHeight) , 
                height : size.verticalScale(textHeight),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                borderBottomLeftRadius : 8,
                borderBottomRightRadius : 8,
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(20),}}>
                <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 16,
                  fontFamily : "Poppins"
                  }}>{shortTitle(props.item.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 15, fontFamily: "Poppins",
                    color : "white"
                  }}>{toTitle(props.item.vendor as string)}</Text>
                </View>
                </View>
              </LinearGradient>
            </ImageBackground>
    </Pressable>
  )
}


async function getProducts(n : number){
  const token = await AsyncStorage.getItem("token")
  if (token === null){
    alert(`Authenticate again`)
    router.replace("/sign-in")
    return;
  }
  const requestOptions = {
    method: "GET",
    headers: {
      "Authorization" : token!,
      "Content-Type" : "application/json",
    },
   };

  try {
    // TODO : change endpoint to liked
    const resp = await fetch(`http://172.24.6.108:8080/products?n=${n}`, requestOptions);
    if (resp.status !== 200){
      router.replace("/sign-in");
      return null;
    }
    const data = await resp.json();

  

    return data;
  } catch(e){
    alert(`failed to get data = ${e}`)
    return null;
  }
}

interface HomeState {
  spotlight : any;
  products : any[];
  loading : boolean;
}

export default class Home extends React.Component<{},HomeState> {
  constructor(props : any){
    super(props);
    this.state = {
      spotlight : item,
      products : [item, item, item, item, item], 
      loading : true,
    }
  }

  async componentDidMount(){
    const products = await getProducts(7);
    if (products === null){
      this.setState({loading : false})
      return;
    }
    else {
      this.setState({spotlight : products[3] , products : products , loading : false})
    }
  }

  render(){
    if (this.state.loading){
      return <View style={{flex : 1,backgroundColor : "black", paddingTop : 40, paddingLeft : 20}}>
            
            <ActivityIndicator style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -50 }, { translateY: -50 }],
            }} size={60} color="white"/>
        </View>
    }
    // TODO : Add activity indicator when loading
    return (
      <ScrollView style={{backgroundColor : "#121212"}}>

        

        <View style={{marginVertical : size.verticalScale(10)}}></View>
        <Pressable onPress={() => router.back()} style={{display : "flex" , flexDirection : "row", marginVertical : 8}}>
                <View  style={{
                    left : 10,
                    top : 10,
                    marginBottom : 10,
                    }}>
                    <Ionicons name="arrow-back" size={32} color="white"/>
                </View>
                <Text style={{
                  color : "white", 
                  fontFamily : "Poppins", 
                  fontSize : 22 , 
                  marginLeft : 20,
                  marginTop : 10,
                  }}>
                    Liked Products
                </Text>
        </Pressable>
        

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
          alwaysBounceVertical={false}
          contentContainerStyle={{flexGrow: 1,}}
        >
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4}}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={this.state.products}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
        />
        </ScrollView>

      </ScrollView>
    )
  }
}
