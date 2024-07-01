import { LinearGradient } from "expo-linear-gradient";
import React , {useRef, useState, useEffect} from "react"
import {
  ScrollView , View , Text, StyleSheet, Image, ImageBackground,
  FlatList,
  Pressable,
  ActivityIndicator,
  Animated,
  TextInput,
  Easing,
} from "react-native";
import * as size from "react-native-size-matters";
import * as Font from "expo-font";
import * as api from "./api"

import {SwipeView} from "./feed"
import {Feather, Ionicons} from "@expo/vector-icons"
import {Search} from "./_search"

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    'Montserrat': require('../assets/fonts/Montserrat.ttf'),
  });
};

import {router} from "expo-router";
import {Logo} from "./_common"
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
  WSFeed : api.WSFeed | null;
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
      WSFeed : null,
    }
  }

  async getProducts(){
    const products = await api.getProducts(7);
    if (products === null){
      this.setState({loading : false})
      return;
    }
    else {
      this.setState({spotlight : products[3] , products : products , loading : false})
    }
  }

  async componentDidMount(){
    const token = await AsyncStorage.getItem('token');
    const wsfeed = new api.WSFeed(token!, (data : any) => {
      this.setState({ queryProducts: this.state.queryProducts.concat(data) });
    });
    this.setState({ WSFeed: wsfeed });

    await fetchFonts();
    await this.getProducts();
  }

  async componentWillUnmount() {
    // closes on reload; major bug fix
    if(this.state.WSFeed !== null && this.state.WSFeed?.open){
      this.state.WSFeed.close();
    }
  }

  handleSwipe = async (action_type : string, index : number) => {
    console.log(`products.length = ${this.state.products.length} , index = ${index}`)
    const filterString = await AsyncStorage.getItem('filter');
    const filter = JSON.parse(filterString as string);
    const { WSFeed, queryProducts, products } = this.state;
    if (WSFeed && WSFeed.open) {
      if (queryProducts.length === 0) {
        WSFeed.sendAction(action_type, products[index].product_id, api.createQuery(null, filter));
        return;
      }
      try {
        WSFeed.sendAction(action_type, queryProducts[index].product_id, api.createQuery(null, filter));
      } catch (e) {
        console.log(`products.length = ${queryProducts.length}, index = ${index}, error = ${e}`);
      }
    }
  };

  renderHome(){
    return (
      <ScrollView style={{backgroundColor : "#121212"}}>

        <Logo />

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
          // TODO : Test this fully
          onRefresh={async () => {
            this.setState({loading : true});
            await this.getProducts();
            this.setState({loading : false});
          }}
          refreshing={this.state.loading}
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
          onSwipe={this.handleSwipe}
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
        "product_id": "e937ef8e-752a-480d-9fd5-c0d727e14259",
        "product_url": "https://pk.ethnc.com/products/casual-shirt-e4035-102-329-329",
        "shopify_id": "6968144101478",
        "handle": "casual-shirt-e4035-102-329-329",
        "title": "Embroidered Shirt (E4035/102/329)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E4035-102-329_1.jpg?v=1707802671",
        "description": "Details:Crafted from a fascinating pale coral fabric, this elegant shirt illustrates a contemporary striped shirt enriched with intricate embroidery at front with floral designs with schiffli technique layered on a contemporary silhouette. The design is completed with delicate lace and trendy embellishments at front placket resulting in a gorgeous look to style this season.-Pale Coral Color-Yarn Dyed Fabric-Stitched Article-1 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
        "price": 2490,
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
                    "Light Pink"
                ]
            }
        ],
        "tags": [
            "AZADISALEWOMENALL22MAR",
            "AZADISALEWOMENPret22MAR",
            "Casual",
            "Casual shirt",
            "casual'23",
            "casual'24",
            "Casual-Full Price",
            "CGST15",
            "E4035/102/329-1-shirt-SimplifiedSizechart",
            "L",
            "M",
            "MSSALEWOMENALL8MAY",
            "MSSALEWomenCasual8MAY",
            "MSSALEWOMENPret8MAY",
            "one piece pret",
            "ONGOING SS'24",
            "PRET SS'24",
            "S",
            "SS-24",
            "Women New In",
            "WOMEN-F.P",
            "XS"
        ],
        "available": true
    },
    {
        "product_id": "9139255b-4d61-4c03-981e-87ed16a561b5",
        "product_url": "https://beechtree.pk/products/ppwesbw230255-multi",
        "shopify_id": "13411366338720",
        "handle": "ppwesbw230255-multi",
        "title": "Button Down Striped Shirt",
        "vendor": "beechtree",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0488/9201/8848/files/PPWESBW230255_1.jpg?v=1715338882",
        "description": "Designed with long sleeves and a button-front design with embroidery on pocket, this shirt is perfect for your handsome one.\nFeatures:\nLong Sleeves\nFront Pocket\nFabric:\nYarn Dyed",
        "price": 749,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "6-7Y",
                    "7-8Y",
                    "8-9Y",
                    "9-10Y",
                    "11-12Y",
                    "13-14Y"
                ]
            },
            {
                "name": "COLOR",
                "position": 2,
                "values": [
                    "MULTI"
                ]
            },
            {
                "name": "FABRIC",
                "position": 3,
                "values": [
                    "YARN DYED"
                ]
            }
        ],
        "tags": [
            "11-12Y",
            "13-14Y",
            "6-7Y",
            "7-8Y",
            "8-9Y",
            "9-10Y",
            "Boys",
            "Boys-Shirts",
            "Boys-WN",
            "Boys-WN23",
            "Boys-WN23-Shirts",
            "child",
            "F-30",
            "Multi",
            "PKR 2000 - PKR 2499",
            "PL-70",
            "pl-sale",
            "pl-winter",
            "pl-winter-boys",
            "sale",
            "sale-boys",
            "sale-by-percentage",
            "sale-season",
            "salebypercenatge",
            "t_size_11-12Y: 25.5\"-15\"-17.25\"-22.5\"",
            "t_size_13-14Y: 26.75\"-15.75\"-17.75\"-23.5\"",
            "t_size_6-7Y: 20.75\"-12.5\"-15\"-16.5\"",
            "t_size_7-8Y: 22.05\"-13.25\"-15.75\"-18.5\"",
            "t_size_8-9Y: 22.75\"-13.75\"-16.5\"-19.5\"",
            "t_size_9-10Y: 24.25\"-14\"-17\"-20.5\"",
            "trouser_size::length-shoulder-chest-sleeve length",
            "w23tag",
            "winter",
            "winter collection",
            "Yarn Dyed"
        ],
        "available": true
    },
    {
        "product_id": "7141e20c-3c37-448b-8df1-4bc425e5d932",
        "product_url": "https://pk.ethnc.com/products/casual-suit-e0476-402-313-313-casual-suit-e0476-302-313-313",
        "shopify_id": "6945103118438",
        "handle": "casual-suit-e0476-402-313-313-casual-suit-e0476-302-313-313",
        "title": "Embroidered Suit (E0476/402/313 E0476/302/313)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E0476-402-313_1.jpg?v=1702978471",
        "description": "Details:A fascinating composition is layered over this beautiful outfit rendered in an appealing baby coral shade. It features a classy silhouette shirt enriched with captivating floral embroidery in vibrant hues. Enhanced with fabric buttons at front, this aesthetic shirt is paired with a solid trouser. Let your girls look graceful in this statement outfit.-Baby Coral Color-Cross Hatch Fabric-Stitched Article-2 piece\nSize & Fit:-Model height is 45-46 Inches-Model is wearing 05-06 Year size",
        "price": 3590,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "3-4Y",
                    "4-5Y",
                    "5-6Y",
                    "6-7Y",
                    "7-8Y",
                    "8-9Y",
                    "9-10Y",
                    "10-11Y",
                    "11-12Y"
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
            "10-11Y",
            "11-12Y",
            "3-4Y",
            "4-5Y",
            "5-6Y",
            "6-7Y",
            "7-8Y",
            "8-9Y",
            "9-10Y",
            "Casual",
            "casual kids",
            "Casual kids New In",
            "casual kids'22",
            "casual kids'23",
            "casual kids'24",
            "casual suits kids",
            "Casual-Full Price",
            "CGST15",
            "E0476/402/313-1-shirt-SimplifiedSizechart",
            "E0476/402/313-2-trouser-SimplifiedSizechart",
            "eastern kids",
            "EASTERN KIDS'23",
            "EASTERN KIDS'24",
            "embroidered",
            "Kids New In",
            "KIDS-F.P",
            "MSSALEKIDSALL8MAY",
            "MSSALEKidsCasual8MAY",
            "MSSALEKIDSEASTERN8MAY",
            "New-In Casual Kids",
            "PKR 2000 - PKR 3990",
            "PRET SS'24 Kids",
            "SS24-KIDS",
            "two piece kids"
        ],
        "available": true
    },
    {
        "product_id": "4c8b9efc-2aeb-4081-bfad-ac457e3c96df",
        "product_url": "https://beechtree.pk/products/btj-11651e-std",
        "shopify_id": "8485824266400",
        "handle": "btj-11651e-std",
        "title": "Earrings",
        "vendor": "beechtree",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0488/9201/8848/files/btj-11651e_1.jpg?v=1685351341",
        "description": "Statement studs are a staple",
        "price": 534,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "1 PAIR"
                ]
            }
        ],
        "tags": [
            "10",
            "12",
            "14",
            "40",
            "40%OFF",
            "8",
            "Accessories",
            "full-price",
            "Jewellery",
            "Jewellery-Earrings",
            "NA-ACC-Jewellery",
            "num_size:8-10-12-14",
            "PKR 500 - PKR 999",
            "s23tag",
            "Sale-ACC",
            "sale-acc-jewellery",
            "salepercent40",
            "STD",
            "SUMMERCOLLECTION",
            "YarnDyed"
        ],
        "available": true
    },
    {
        "product_id": "cf53f250-d640-4c59-aec5-0a06d55de177",
        "product_url": "https://www.crossstitch.pk/products/zinnia-3",
        "shopify_id": "6955423334465",
        "handle": "zinnia-3",
        "title": "Zinnia 3",
        "vendor": "cross_stitch",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0178/4492/8612/files/0123STBBAS0203_3.jpg?v=1682497435",
        "description": "100% COTTON CAMBRIC DYED BASIC PANTS",
        "price": 1460,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "XS",
                    "L",
                    "M",
                    "S"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "ANGORA"
                ]
            },
            {
                "name": "Fabric",
                "position": 3,
                "values": [
                    "CAMBRIC"
                ]
            }
        ],
        "tags": [
            "0123STBBAS0203",
            "APRIL 2023",
            "Basic Pants",
            "Bottoms",
            "CLASS: BOTTOM",
            "COLLECTION: SS-23 RTW BASIC PANTS EDIT-2",
            "DCS: PRO TYP: RTWBTMBPA",
            "PRO TYP: SEMI FORMAL",
            "Sale",
            "SEASON: SS-23",
            "SF TRT: DYED"
        ],
        "available": true
    },
    {
        "product_id": "3cabe682-d064-4723-ba41-bb0ca36fa9ba",
        "product_url": "https://www.alkaramstudio.com/products/dyed-cambric-kurta-gmku1010-grey",
        "shopify_id": "7449099370676",
        "handle": "dyed-cambric-kurta-gmku1010-grey",
        "title": "Dyed Cambric Kurta",
        "vendor": "alkaram_studio",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/R-SP-304_1.jpg?v=1718587639",
        "description": "Fabric: CambricFit: SlimCollar Style: Bend",
        "price": 2065,
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
                    "XL",
                    "XXL"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Grey"
                ]
            },
            {
                "name": "Fabric",
                "position": 3,
                "values": [
                    "Cambric"
                ]
            }
        ],
        "tags": [
            "25%Off",
            "FLAT 30%",
            "GMKU1010-Grey-Simplifiedsizechart",
            "Kurta",
            "Man",
            "New In",
            "Ready To Wear",
            "Sale 2022",
            "Sale Man Ready to Wear",
            "show-quickview",
            "showpret",
            "uploaded-02-Nov"
        ],
        "available": true
    },
    {
        "product_id": "c6aa488c-08ba-44e7-a0a8-c3b0f99ca186",
        "product_url": "https://outfitters.com.pk//products/f0938-106",
        "shopify_id": "7855321841855",
        "handle": "f0938-106",
        "title": "All Over Print T Shirt",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0938106999_6.jpg?v=1718191792",
        "description": "Fit RegularThe name says it all the right size slightly snugs the body leaving enough room for comfort in the sleeves and waist. Does not taper down and offers a relaxed silhouette for your everyday looks Composition & Care  \n100%  Cotton \nMachine wash up to 30C/86F, gentle cycle \nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 2290,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Multi Color"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "S",
                    "M",
                    "L",
                    "XL"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "HS-24"
                ]
            }
        ],
        "tags": [
            "2023-2024",
            "2024",
            "B15-SS24",
            "M- Tshirt-SS-24",
            "M-TS-Regular-SimplifiedSizechart",
            "Men",
            "men-size-chart",
            "Multi Color",
            "NewMenSS-24",
            "Pattern",
            "PKR 2090 - PKR 2990",
            "Regular",
            "SS-24",
            "Summer",
            "Summer-24",
            "T-Shirts",
            "Tees",
            "Top"
        ],
        "available": true
    }
]