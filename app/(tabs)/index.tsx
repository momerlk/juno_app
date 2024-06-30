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
import * as api from "./api"

import {SwipeView} from "./feed"

import {Feather, Ionicons} from "@expo/vector-icons"

import {Search} from "../search"

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    'Montserrat': require('../assets/fonts/Montserrat.ttf'),
  });
};

import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
  category : {
    height : size.verticalScale(120),
    margin : size.moderateScale(20),
    borderRadius : size.scale(23),
    paddingVertical : size.moderateScale(10),
    paddingHorizontal : size.moderateScale(33),
  },
   imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',  // Aligns children to the bottom
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    height: size.scale(70),
    width: size.scale(70),
    borderRadius: size.scale(35),
  },

  text: {
    fontSize: size.verticalScale(15),
    textAlign: 'center',
  },
})



// TODO : Add backend data gettting logic
// TODO : Add save progress logic



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
  return (
    <Pressable onPress={
      () => {
        router.navigate({
          pathname: "/details",
          params: props.item
        })
      }
    }>
      <ImageBackground
              style={{
                height : size.verticalScale(250), 
                minWidth : size.verticalScale(150),
                marginHorizontal : size.moderateScale(3),
                marginVertical : size.verticalScale(5),
              }}
              imageStyle={{
                borderRadius : 8,
              }}
              source={{ uri: props.item.image_url }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.7)"]} style={{
                marginTop : size.verticalScale(170) , 
                height : size.verticalScale(80),
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


interface HomeState {
  spotlight : any;
  products : any[];
  queryProducts : any[];
  loading : boolean;
  query : string;
}

export default class Home extends React.Component<{},HomeState> {
  constructor(props : any){
    super(props);
    this.state = {
      spotlight : mockData[0],
      products : mockData, 
      loading : true,
      query : "",
      queryProducts : [],
    }
  }

  async componentDidMount(){
    await fetchFonts();
    const products = await api.getProducts(7);
    if (products === null){
      this.setState({loading : false})
      return;
    }
    else {
      this.setState({spotlight : products[3] , products : products , loading : false})
    }
  }

  renderHome(){
    return (
      <ScrollView style={{backgroundColor : "#121212"}}>

        <Text style={{
          color : "white",
          position : "absolute",
          marginTop : size.verticalScale(30), 
          marginHorizontal : 30,
          fontSize : 25,
          fontFamily : "Poppins"
          }}>JUNO</Text>

        <View style={{
          display : "flex", 
          flex : 1, 
          flexDirection : "row-reverse", 
          marginTop : size.verticalScale(30), 
          marginHorizontal : 30,
          }}>
          
          <Pressable onPress={() => router.navigate("/(tabs)/cart")} style={{margin: 10,}}>
            <Ionicons name="cart-outline" size={28} color="white" />
          </Pressable>

          <Pressable onPress={() => router.navigate("/liked")} style={{margin : 10}}>
            <Feather name="heart" size={25} color="white" /> 
          </Pressable>
          
        </View>

        <Search 
          placeholder="What do you want to buy?" 
          onSubmit={async (v : string) => {
            const products = await api.search(v);
            if(products !== null && products !== undefined){
              this.setState({query : v , queryProducts : products})
            }
          }}
          onChange={(v : string) => {
            if (v === ""){
              this.setState({query : ""})
            }
          }}
        />

        {/* TODO : Navigate to feed instead of showing details. */}
        <Pressable onPress={() => {
          router.navigate({
            pathname: "/details",
            params: this.state.spotlight
          })}
        }>
        <ImageBackground
              style={{
                height : size.verticalScale(370), 
                marginHorizontal : size.moderateScale(30),
                marginVertical : size.verticalScale(10),
              }}
              imageStyle={{
                borderRadius : 20,
              }}
              source={{ uri: this.state.spotlight.image_url }}
            >
                {/* Implement background color detection and make that the background of the feed screen */}
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.7)"]} style={{
                marginTop : size.verticalScale(270) , 
                height : size.verticalScale(100),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                borderBottomLeftRadius : 20,
                borderBottomRightRadius : 20,
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(20),}}>
                <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 17,
                  fontFamily : "Poppins"
                  }}>{shortTitle(this.state.spotlight.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 20, fontFamily: "Poppins",
                    color : "white"
                  }}>{toTitle(this.state.spotlight.vendor as string)}</Text>
                  <Text style={{
                    fontSize: 18, marginVertical: 5,
                    color : "white",
                    fontFamily : "Poppins",
                  }}>Rs. {(() => {
                    let l = 0
                    try {
                      l = this.state.spotlight.price.length;
                    } catch (e){
                      return "N/A"
                    }
                      let pos = (l) - 3;
                      if (pos > 0) {
                        const firstPart = this.state.spotlight.price.slice(0, pos);
                        const secondPart = this.state.spotlight.price.slice(pos);

                        // Concatenate the first part, substring, and second part
                        const newString = firstPart + "," + secondPart;
                        return newString;
                      } else {
                        return this.state.spotlight.price
                      }
                    })()}</Text>
                </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        
          


        <View style={{marginVertical : size.verticalScale(10)}}></View>

        <Text style={{color : "white", fontFamily : "Poppins", fontSize : 18 , marginLeft : 20}}>For You</Text>

        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
          alwaysBounceVertical={false}
          contentContainerStyle={{flexGrow: 1,}}
        >
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4}}
          numColumns={4}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
          data={this.state.products}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
        />
        </ScrollView>
      </ScrollView>
    )
  }

  update(products : any){
    this.setState({queryProducts : products})
  }

  renderSearch(){
    return (
      <View style={{flex : 1, backgroundColor : "black"}}>
        <View style={{marginTop : size.verticalScale(10)}}></View>
        <Pressable onPress={() => this.setState({query : ""})} style={{display : "flex" , flexDirection : "row", marginTop : 8}}>
                <View  style={{
                    left : 10,
                    top : 10,
                    marginBottom :5,
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
                    Home
                </Text>
        </Pressable>
        <SwipeView 
          paddingTop={1}
          cards={this.state.queryProducts} 
          height={size.verticalScale(540)} 
          onSwipe={(action : string) => {}}
          onFilter={async (filter : any) => {
            try { 
              const products = await api.queryProducts(this.state.query , filter);
              if (products === null || products === undefined){
                return;
              }
              this.update(products);
            } catch (e){
              alert(`failed to set storage , error = ${e}`)
            }
          }}
          loading={false}
        />
      </View>
    )
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
      <>
        {/* <Text style={{color : "white", fontFamily : "Poppins", fontSize : 24, alignSelf  :"center"}}>Feed</Text> */}

        {this.state.query === "" ? this.renderHome() : this.renderSearch()}

        {/* TODO : Add these two sections */}

        {/* <Text style={{color : "white", fontFamily : "Poppins", fontSize : 18 , marginLeft : 20, marginVertical : size.verticalScale(25)}}>Top Categories</Text>

        <Text style={{color : "white", fontFamily : "Poppins", fontSize : 18 , marginLeft : 20, marginVertical : size.verticalScale(25)}}>Top Brands</Text> */}

      </>
    )
  }
}


const mockData = [
    {
        "product_id": "824913c8-c6fb-4208-b622-866baec4b261",
        "product_url": "https://pk.ethnc.com/products/toddler-dress-e0759-301-707-707",
        "shopify_id": "6877464199270",
        "handle": "toddler-dress-e0759-301-707-707",
        "title": "Printed Dress (E0759/301/707)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E0759-301-707_1.jpg?v=1695815550",
        "description": "Details:A fascinating design is layered over this elegant dress illustrating a graceful composition in grass green shade. Crafted in a chic silhouette, this contemporary dress is enhanced with floral illustrations printed in vibrant hues. Style this exquisite dress at fun gatherings this season.-Grass Green Color-1 piece\nSize & Fit:-Model height is 40-42 Inches-Model is wearing 3-4 Year size",
        "price": 1590,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "12-18M",
                    "2-3Y",
                    "3-4Y",
                    "4-5Y"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Green"
                ]
            }
        ],
        "tags": [
            "12-18M",
            "2-3Y",
            "3-4Y",
            "4-5Y",
            "Below - PKR 1990",
            "Chota Fusion",
            "Chota fusion dress",
            "Chota fusion dress toddler",
            "Chota fusion dress toddler'22",
            "Chota fusion dress toddler'23",
            "CHOTA FUSION TODDLER'23",
            "dress",
            "DRESS & JUMPSUIT TODDLER",
            "DRESS & JUMPSUIT TODDLER'23",
            "DRESS & JUMPSUIT TODDLER'23 fusion dress toddler",
            "DRESSES",
            "E0759/301/707dress",
            "ESSALE21DEC",
            "ESSALEKIDSALL21DEC",
            "ESSALEKIDSCHOTAFUSION21DEC",
            "FSSALEKIDSALL22NOVREV",
            "FSSALEKIDSCHOTAFUSION22NOVREV",
            "fusion dress toddler'22",
            "fusion dress toddler'23",
            "Fusion kids",
            "Fusion-Full Price",
            "girls toddler",
            "kids fusion'23",
            "Kids Fusion-Full Price",
            "Kids New In",
            "KIDS-F.P",
            "matter-size",
            "New-In Fusion Kids",
            "one piece kids",
            "Pret WS'23 Kids",
            "toddler fusion WS'23",
            "WF winter disc",
            "WINTERSALEKIDSALL",
            "WINTERSALEKIDSCHOTAFUSION",
            "WS23-KIDS"
        ],
        "available": true
    },
    {
        "product_id": "70753f3d-a2f8-4b9d-84a1-dbc992449294",
        "product_url": "https://pk.ethnc.com/products/toddler-dress-e0555-301-411-411",
        "shopify_id": "6859038589030",
        "handle": "toddler-dress-e0555-301-411-411",
        "title": "Dress (E0555/301/411)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/products/E0555-301-411_1.jpg?v=1681969911",
        "description": "Details:A fascinating design is layered over this elegant dress rendered in lavender shade. Crafted in a chic peplum silhouette with gathers below yoke, this contemporary dress is enhanced with floral illustrations printed in vibrant hues. Style this exquisite dress at casual gatherings this season.-Lavender Color-Single Jersey Fabric-1 piece\nSize & Fit:-Model height is 40-42 Inches-Model is wearing 3-4 Year size",
        "price": 790,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "12-18M",
                    "2-3Y",
                    "3-4Y",
                    "4-5Y"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Pink"
                ]
            }
        ],
        "tags": [
            "12-18M",
            "17 APRIL",
            "2-3Y",
            "3-4Y",
            "4-5Y",
            "Chota Fusion",
            "Chota fusion dress",
            "Chota fusion dress toddler",
            "Chota fusion dress toddler'23",
            "Chota fusion toddler",
            "CHOTA FUSION TODDLER'23",
            "DRESS & JUMPSUIT TODDLER",
            "DRESS & JUMPSUIT TODDLER'23",
            "E0171/301/321top",
            "fusion dress toddler'23",
            "Fusion-Full Price",
            "girls toddler",
            "kids fusion'23",
            "Kids Fusion-Full Price",
            "Kids New In",
            "KIDS-F.P",
            "matter-size",
            "New-In Fusion Kids",
            "one piece kids",
            "Pret SS'23 Kids",
            "SALEKIDS23AUGNEW",
            "SALEKIDSALL23AUG",
            "SALEKIDSCHOTAFUSION23AUG",
            "SS23-KIDS",
            "SUMMERCLEARANCEKIDSALL",
            "SUMMERCLEARANCEKIDSCHOTAFUSION",
            "toddler fusion SS'23"
        ],
        "available": true
    },
    {
        "product_id": "dd37fd7a-0bac-4632-ad0e-437bcf8ba4d8",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1600-108-522-522",
        "shopify_id": "7237305892966",
        "handle": "western-dress-e1600-108-522-522",
        "title": "Dress (E1600/108/522)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1600-108-522_1.jpg?v=1716294189",
        "description": "Details:Style like a diva in this vibrant dress rendered in mesmerizing shades. Crafted in a contemporary silhouette, this gorgeous dress is beautifully adorned with fascinating floral prints in vibrant purple orchid color. Style this statement dress at fun events this season.-Purple Orchid Color-Cotton Linen Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 4890,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Purple"
                ]
            }
        ],
        "tags": [
            "CGST15",
            "DRESSES",
            "E1600/108/522-1-dress-SimplifiedSizechart",
            "New-In Western",
            "one piece pret",
            "ONGOING SS'24",
            "PRET SS'24",
            "shopify",
            "SS-24",
            "SummerSale24WomenALL27June24",
            "SummerSale24WomenPret27June24",
            "SummerSale24WomenWestern27June24",
            "Western",
            "Western dress",
            "western dress'23",
            "western summer'24",
            "Western'24",
            "Western-Full Price",
            "Western-Full PriceFP24",
            "Women New In",
            "WOMEN-F.P"
        ],
        "available": true
    },
    {
        "product_id": "4a180ce4-48eb-4620-8e08-7c7adc3bbefe",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1568-108-307-307",
        "shopify_id": "7219459293286",
        "handle": "western-dress-e1568-108-307-307",
        "title": "Dress (E1568/108/307)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1568-108-307_1.jpg?v=1714638020",
        "description": "Details:Style like a diva in this vibrant dress rendered in mesmerizing shades. Crafted in a contemporary silhouette, this gorgeous dress is beautifully adorned with fascinating floral prints in vibrant colors. Style this statement dress at fun events this season.-Crimson Red Color-Cotton Linen Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 4890,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Red"
                ]
            }
        ],
        "tags": [
            "CGST15",
            "DRESSES",
            "E1568/108/307-1-dress-SimplifiedSizechart",
            "New-In Western",
            "one piece pret",
            "ONGOING SS'24",
            "PRET SS'24",
            "shopify",
            "SS-24",
            "SummerSale24WomenALL27June24",
            "SummerSale24WomenPret27June24",
            "SummerSale24WomenWestern27June24",
            "Western",
            "Western dress",
            "western dress'23",
            "western summer'24",
            "Western'24",
            "Western-Full Price",
            "Western-Full PriceFP24",
            "Women New In",
            "WOMEN-F.P"
        ],
        "available": true
    },
    {
        "product_id": "350f1bba-9b53-4aa7-aa70-513ccc6043be",
        "product_url": "https://pk.ethnc.com/products/toddler-dress-e0272-301-423-423",
        "shopify_id": "6817365229670",
        "handle": "toddler-dress-e0272-301-423-423",
        "title": "Dress (E0272/301/423)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/products/E0272-301-423_1.jpg?v=1666003294",
        "description": "Details:A fascinating design is layered over this elegant dress rendered in blush pink shade. Crafted in a chic silhouette with gathers below yoke and adorned with pockets, this contemporary dress is enhanced with quirky cartoon illustration prints in vibrant hues. Style this exquisite dress at casual gatherings this season.-Blush Pink Color-Jersey Fabric-1 piece\nSize & Fit:-Model height is 40-42 Inches-Model is wearing 3-4 Year size",
        "price": 850,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "12-18M",
                    "2-3Y",
                    "3-4Y",
                    "4-5Y"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Light Pink"
                ]
            }
        ],
        "tags": [
            "12-18M",
            "17 oct",
            "2-3Y",
            "3-4Y",
            "4-5Y",
            "AS22-KIDS",
            "Below - PKR 1990",
            "Chota Fusion",
            "Chota fusion dress",
            "Chota fusion toddler",
            "CHOTA FUSION TODDLER'23",
            "DRESS & JUMPSUIT TODDLER",
            "DRESS & JUMPSUIT TODDLER'23",
            "fusion dress toddler",
            "fusion dress toddler'22",
            "girls toddler",
            "GTTF313046dress",
            "kids fusion'23",
            "Kids New In",
            "KIDS-F.P",
            "matter-size",
            "New-In Fusion Kids",
            "one piece kids",
            "PARTSALEKIDSALL10MAY",
            "PARTSALEKIDSCHOTAFUSION10MAY",
            "pink",
            "Pret AS'22 Kids",
            "Pret SS'23 Kids",
            "SS23-KIDS",
            "SUMMERCLEARANCEKIDSALL",
            "SUMMERCLEARANCEKIDSCHOTAFUSION",
            "toddler fusion AS'22",
            "wonderland kids fusion"
        ],
        "available": true
    },
    {
        "product_id": "09da78cd-2d59-4ef5-87d4-b39109b3c9e9",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1527-108-112-112",
        "shopify_id": "6959789998182",
        "handle": "western-dress-e1527-108-112-112",
        "title": "Dress (E1527/108/112)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1527-108-112_1.jpg?v=1706004461",
        "description": "Details:A gracefully elegant composition is layered over this trendy dress rendered in a classy yellow beige shade. Crafted in a contemporary silhouette this flowy dress with round neck is adorned with checkered prints in subtle hues. Style this contemporary dress at fun parties and be the epitome of grace this season.-Yellow Beige Color-Cotton Linen Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 3490,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Beige"
                ]
            }
        ],
        "tags": [
            "AZADISALEWOMENALL22MAR",
            "AZADISALEWOMENPret22MAR",
            "CGST15",
            "dress",
            "DRESSES",
            "E1527/108/112-1-dress-SimplifiedSizechart",
            "E1527/108/112-SimplifiedSizechart",
            "L",
            "M",
            "MSSALEWOMENALL8MAY",
            "MSSALEWOMENPret8MAY",
            "MSSALEWomenWestern8MAY",
            "New-In Western",
            "one piece pret",
            "ONGOING WS'23",
            "PKR 6000 - Above",
            "PRET SS'24",
            "S",
            "Western",
            "Western dress",
            "western dress'23",
            "western summer'23",
            "western summer'24",
            "Western'23",
            "Western'24",
            "Western-Full Price",
            "Western-Full PriceFP23",
            "Women New In",
            "WOMEN-F.P",
            "WS-23",
            "XS"
        ],
        "available": true
    },
    {
        "product_id": "05150ab0-a351-4a61-8067-cc0090642b51",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1512-108-003-003",
        "shopify_id": "7012652384358",
        "handle": "western-dress-e1512-108-003-003",
        "title": "Dress (E1512/108/003)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1512-108-003_1.jpg?v=1708420625",
        "description": "Details:A gracefully elegant composition is layered over this contemporary dress rendered in a classy coconut milk shade and illustrating a checkered canvas. Crafted in an on-trend silhouette with gathers, this flowy dress is enriched with captivating pattern embroidered in vibrant hues. Style this classy dress at fun parties and be the epitome of grace this season.-Coconut Milk Color-Cotton Linen Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 4490,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Off White"
                ]
            }
        ],
        "tags": [
            "AZADISALEWOMENALL22MAR",
            "AZADISALEWOMENPret22MAR",
            "CGST15",
            "dress",
            "DRESSES",
            "E1512/108/003-1-dress-SimplifiedSizechart",
            "L",
            "M",
            "MSSALEWOMENALL8MAY",
            "MSSALEWOMENPret8MAY",
            "MSSALEWomenWestern8MAY",
            "New-In Western",
            "one piece pret",
            "ONGOING SS'23",
            "PKR 4000 - PKR 5990",
            "PRET SS'24",
            "S",
            "SS-24",
            "Western",
            "Western dress",
            "western dress'23",
            "western winter'23",
            "Western'23",
            "Western'24",
            "Western-Full Price",
            "Western-Full PriceFP23",
            "Women New In",
            "WOMEN-F.P",
            "XS"
        ],
        "available": true
    },
    {
        "product_id": "c2963e9c-1cc8-4718-af76-7989f532de6a",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1568-108-626-626",
        "shopify_id": "7219459326054",
        "handle": "western-dress-e1568-108-626-626",
        "title": "Dress (E1568/108/626)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1568-108-626_1.jpg?v=1714638050",
        "description": "Details:Style like a diva in this vibrant dress rendered in lavender shade. Crafted in a contemporary silhouette, this gorgeous dress is beautifully adorned with fascinating floral prints in refreshing lavender blue tones. Style this statement dress at fun events this season.-Lavender Blue Color-Cotton Linen Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 4890,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Blue"
                ]
            }
        ],
        "tags": [
            "CGST15",
            "DRESSES",
            "E1568/108/626-1-shirt-SimplifiedSizechart",
            "New-In Western",
            "one piece pret",
            "ONGOING SS'24",
            "PRET SS'24",
            "shopify",
            "SS-24",
            "SummerSale24WomenALL27June24",
            "SummerSale24WomenPret27June24",
            "SummerSale24WomenWestern27June24",
            "Western",
            "Western dress",
            "western dress'23",
            "western summer'24",
            "Western'24",
            "Western-Full Price",
            "Western-Full PriceFP24",
            "Women New In",
            "WOMEN-F.P"
        ],
        "available": true
    },
    {
        "product_id": "7d1bdf17-289f-4b4b-b3dc-16491028ef10",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1532-108-113-113",
        "shopify_id": "6959790030950",
        "handle": "western-dress-e1532-108-113-113",
        "title": "Dress (E1532/108/113)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1532-108-113_1.jpg?v=1706004513",
        "description": "Details:A gracefully elegant composition is layered over this trendy dress rendered in a classy beige shade. Crafted in a contemporary silhouette with panels, this flowy dress with V neck and elasticated sleeves opening is must have to style this season. Style this contemporary dress at fun parties and be the epitome of grace.-Beige Color-Cotton Linen Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 3490,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Beige"
                ]
            }
        ],
        "tags": [
            "AZADISALEWOMENALL22MAR",
            "AZADISALEWOMENPret22MAR",
            "CGST15",
            "dress",
            "DRESSES",
            "E1532/108/002-SimplifiedSizechart",
            "L",
            "M",
            "MSSALEWOMENALL8MAY",
            "MSSALEWOMENPret8MAY",
            "MSSALEWomenWestern8MAY",
            "New-In Western",
            "one piece pret",
            "ONGOING WS'23",
            "PKR 6000 - Above",
            "PRET SS'24",
            "S",
            "Western",
            "Western dress",
            "western dress'23",
            "western summer'23",
            "western summer'24",
            "Western'23",
            "Western'24",
            "Western-Full Price",
            "Western-Full PriceFP23",
            "Women New In",
            "WOMEN-F.P",
            "WS-23",
            "XS"
        ],
        "available": true
    },
    {
        "product_id": "7115fa70-28e3-4396-888f-44d1d486bc47",
        "product_url": "https://pk.ethnc.com/products/western-dress-e1119-108-999-999",
        "shopify_id": "6875328053350",
        "handle": "western-dress-e1119-108-999-999",
        "title": "Printed Dress (E1119/108/999)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E1119-108-999_1.jpg?v=1697441318",
        "description": "Details:Style like a diva in this vibrant dress rendered in a vibrant shade. Crafted in a contemporary silhouette with pleats at front, this gorgeous dress is beautifully adorned with artistic floral prints in monochromatic tones. Style this statement dress at fun events this season.-Multi Color-Interlock Fabric-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 2690,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Multi"
                ]
            }
        ],
        "tags": [
            "dress",
            "DRESSES",
            "E0218/108/707-SimplifiedSizechart",
            "FSSALEWOMENALL22NOVNR",
            "FSSALEWOMENPret22NOVNR",
            "L",
            "M",
            "New-In Western",
            "Nov S Disc",
            "one piece pret",
            "ONGOING WS'23",
            "PKR 2000 - PKR 3990",
            "PRET WS'23",
            "S",
            "SALEWOMENALL3Nov",
            "SALEWOMENPret3Nov",
            "SUMMERCLEARANCEWOMENALL",
            "SUMMERCLEARANCEWOMENPret",
            "Western",
            "Western dress",
            "western dress'23",
            "western summer'23",
            "Western'23",
            "Western-Full Price",
            "Western-Full PriceFP23",
            "Women New In",
            "WOMEN-F.P",
            "WS-23",
            "XS"
        ],
        "available": true
    }]