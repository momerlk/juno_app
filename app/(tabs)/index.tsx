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
      products : mockData.splice(1,8), 
      loading : true,
      query : "",
      queryProducts : [],
      WSFeed : null,
    }
  }

  async getProducts(){
    const products = await api.getProducts(9);
    if (products === null){
      this.setState({loading : false})
      return;
    }
    else {
      this.setState({spotlight : products[0] , products : products.splice(1,8) , loading : false})
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


const mockData =[
    {
        "product_id": "33d5c38e-ef26-49ce-8c64-01aaee431adf",
        "product_url": "https://outfitters.com.pk//products/f0198-303",
        "shopify_id": "7684938039487",
        "handle": "f0198-303",
        "title": "Mandarian Collar Plain Shirt",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303001_1.jpg?v=1711016742",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303001_1.jpg?v=1711016742",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303001_3.jpg?v=1711016742",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303001_2.jpg?v=1711016742",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303001.jpg?v=1714456685",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303001_2_ba469b50-47e8-4740-8820-b3d5585ee7f9.jpg?v=1714456685",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303622_2.jpg?v=1714456685",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303622_5.jpg?v=1714456685",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303622_4.jpg?v=1714456685",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303622.jpg?v=1714456730",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0198303622_2_e2579b7a-ff68-40e8-b6af-1ab980f2e5de.jpg?v=1714456730"
        ],
        "description": "Fit RegularThe name says it all the right size slightly snugs the body leaving enough room for comfort in the sleeves and waist. Does not taper down and offers a relaxed silhouette for your everyday looks Composition & Care  \n50% Cotton 50% linen\nMachine wash up to 30C/86F, gentle cycle \nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 1390,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "White",
                    "Indigo Blue"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "06-12M",
                    "12-18M",
                    "18-24M",
                    "02-03Y",
                    "03-04Y",
                    "04-05Y"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "SS-24"
                ]
            }
        ],
        "tags": [
            "2023-2024",
            "2024",
            "all-baby-boys",
            "B09-SS24",
            "bb-new",
            "Boys",
            "Boys Toddler",
            "Junior SS-24",
            "Juniors",
            "JuniorSpecialPrices",
            "Kids",
            "mss24",
            "PKR 2090 - PKR 2990",
            "Plains",
            "Regular",
            "Shirts",
            "SS-24",
            "st24",
            "st24-Boys",
            "Summer",
            "Summer-24",
            "TB-003-SimplifiedSizechart",
            "TB-Shirts-Sale",
            "TB-Shirts-SS-24",
            "TBSpecialPrice",
            "ToddlerBoysSize-chart",
            "Top",
            "White"
        ],
        "available": true
    },
    {
        "product_id": "5f8d9dce-22db-4290-9f49-aef59b796a2a",
        "product_url": "https://breakout.com.pk//products/4csmd620-blu",
        "shopify_id": "7445186740278",
        "handle": "4csmd620-blu",
        "title": "Stretch Skinny Fit Denim",
        "vendor": "breakout",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/4CSMD620-BLU_1.jpg?v=1714808864",
        "images": [
            "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/4CSMD620-BLU_1.jpg?v=1714808864",
            "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/4CSMD620-BLU_2.jpg?v=1714808864",
            "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/4CSMD620-BLU_3.jpg?v=1714808865"
        ],
        "description": "98% Cotton 2% Lycra",
        "price": 3149,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "30",
                    "32",
                    "34",
                    "36",
                    "38"
                ]
            },
            {
                "name": "COLOR",
                "position": 2,
                "values": [
                    "BLUE"
                ]
            }
        ],
        "tags": [
            "24-SUM",
            "98% Cotton 2% Lycra",
            "BOTTOM",
            "DENIM",
            "FLAT30",
            "FS",
            "Garments",
            "MEN",
            "SALE"
        ],
        "available": true
    },
    {
        "product_id": "d4375d2f-6118-4f54-af6d-4b66e81183d7",
        "product_url": "https://bonanzasatrangi.com/products/ss6242p16-pink",
        "shopify_id": "8211080052899",
        "handle": "ss6242p16-pink",
        "title": "Pink Yarn Dyed 2 Piece (Ss6242P16)",
        "vendor": "bonanza_satrangi",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16_1.jpg?v=1707194738",
        "images": [
            "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16_1.jpg?v=1707194738",
            "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16_2.jpg?v=1707194738",
            "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16_3.jpg?v=1707194738",
            "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16_4.jpg?v=1707194738",
            "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16_5.jpg?v=1707194738"
        ],
        "description": "Stitched 2-Piece Suit\nShirt:Yarn Dyed Lurex Doria Shirt, Band Collar Embellishement On Placket.\nTrouser: Yarn Dyed Cotton Trouser.\nModel Height: 5'7 And She Is Wearing Size 8",
        "price": 3952,
        "currency": "PKR",
        "options": [
            {
                "name": "size",
                "position": 1,
                "values": [
                    "8",
                    "10",
                    "12",
                    "14",
                    "16"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "PINK"
                ]
            },
            {
                "name": "Design",
                "position": 3,
                "values": [
                    "SS6242P16"
                ]
            }
        ],
        "tags": [
            "10",
            "12",
            "14",
            "16",
            "2-Piece",
            "2Piece",
            "6",
            "8",
            "Collection: Summers",
            "Design-23",
            "designcode_SS6242P16-PINK",
            "Exclusive Pret Sale",
            "Female",
            "First10",
            "New Arrivals",
            "NewArrivals",
            "Piece-2023",
            "Pink",
            "PKR 5500 - PKR 6999",
            "Pret",
            "Printed",
            "Ready To Wear",
            "sizechart_link:https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SS6242P16.jpg",
            "Stitched",
            "Summer 2024",
            "SUMMER COLLECTION 2024",
            "Summers Pret",
            "Women",
            "Women Ready to Wear",
            "Yarn Dyed"
        ],
        "available": true
    },
    {
        "product_id": "aa880275-6213-45f8-94c5-dd8079f5f5fa",
        "product_url": "https://www.alkaramstudio.com/products/2-pc-embroidered-khaddar-suit-with-khaddar-trouser-nc-01-22-orange",
        "shopify_id": "7324079849652",
        "handle": "2-pc-embroidered-khaddar-suit-with-khaddar-trouser-nc-01-22-orange",
        "title": "2 Pc Embroidered Khaddar Suit With Khaddar Trouser",
        "vendor": "alkaram_studio",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/nc-01-22-orange-1_t71hwkvg2ibokdtg_7e3c736a-6815-40ad-a8da-6125e57fc6b6.jpg?v=1718501751",
        "images": [
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/nc-01-22-orange-1_t71hwkvg2ibokdtg_7e3c736a-6815-40ad-a8da-6125e57fc6b6.jpg?v=1718501751",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/nc-01-22-orange-2_8jpaevhkxcke4rtm_c2624dce-7d46-4e8f-8b88-170855c62e83.jpg?v=1718501754",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/nc-01-22-orange-3_sappkqbj0bvmsbjh_5cde9d10-fbf3-4fbd-b5cb-4a1f758ed25e.jpg?v=1718501757",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/nc-01-22-orange-4_i6qh4qdfo7f7vsuz_a0f67ae4-64ab-4dfc-855f-2d087ccddb36.jpg?v=1718501760",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/nc-01-22-orange-5_b7m4admacpc665rt_8620ab28-6109-4ca7-9341-a9116798f66e.jpg?v=1718501763"
        ],
        "description": "\"Unstitched 2-PieceEmbroidered Khaddar Suit With Khaddar TrouserColor: Orange Collection: Neon Capsule'22Shirt:Embroidered Khaddar Shirt 3.13 MetersFabric: KhaddarTrouser: Dyed Khaddar Trouser Fabric: Khaddar",
        "price": 3660,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Orange"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "5.63"
                ]
            },
            {
                "name": "Fabric",
                "position": 3,
                "values": [
                    "Khaddar"
                ]
            }
        ],
        "tags": [
            "2 Piece",
            "6100",
            "Capsule",
            "Care",
            "FS",
            "Neon",
            "Neon Capsule-22",
            "New In",
            "Orange",
            "Pret",
            "Sale 2022",
            "Shirt Trouser",
            "show-quickview",
            "Unstitched",
            "Uploaded29-Dec-2022",
            "Woman",
            "Woman Unstitched"
        ],
        "available": true
    },
    {
        "product_id": "30922afd-8644-4b97-8e2c-f27746fa5861",
        "product_url": "https://pk.sapphireonline.pk/products/u3pe-lx24v3-4-t-1",
        "shopify_id": "7735292035146",
        "handle": "u3pe-lx24v3-4-t-1",
        "title": "Printed Cambric Culottes",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/U3PELX24V34T_1.jpg?v=1719583564",
        "images": [
            "https://cdn.shopify.com/s/files/1/1592/0041/files/U3PELX24V34T_1.jpg?v=1719583564",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/U3PELX24V34T_2.jpg?v=1719583564"
        ],
        "description": "Complete your Eid look in our light blue printed cambric bootcut.\nCulottesColour: Light BlueFabric: Cambric\nSIZE & FITModel height: 5 Feet 6 InchesModel Wears: XS\n\n\n\n\nSize\nXS\nS\nM\nL\nXL\n\n\nLength\n35.125\n36\n36.875\n37.75\n37.75\n\n\nFront Rise\n11.5\n12\n13\n14\n15\n\n\nBack Rise\n14.5\n15\n16\n17\n18\n\n\nWaist Relaxed\n13\n14\n15\n16\n17\n\n\nWaist Extended\n19\n20\n21\n22\n23\n\n\nBottom Half\n11.25\n12\n12.75\n13.5\n14.25\n\n\n",
        "price": 995,
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
            }
        ],
        "tags": [
            "1 Piece",
            "1000 - 3000",
            "15-Percent-Tax",
            "1PC",
            "50% OFF",
            "50-restocked-july-sale-24",
            "all-woman-unstitched",
            "Bari Eid",
            "Blue",
            "Bottoms",
            "brands in pakistan",
            "Cambric",
            "clothes",
            "Eid",
            "Eid 2",
            "Eid Collection",
            "Eid Edition",
            "Eid II",
            "Eid ul Adha",
            "Eid ul Azha",
            "everything-June-sale-under-2000",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "fashion",
            "home-edition",
            "June-sale-2024",
            "kapde",
            "kapdon ke design",
            "Ladies",
            "Ladies Pret",
            "Ladies Ready To Wear",
            "Ladies Stitched",
            "ladies suit design",
            "Light Blue",
            "matching-separates",
            "new dress design",
            "New in stitched 2024",
            "New-all-9th-May-24",
            "Office Wear",
            "One Piece",
            "pakistani dresses",
            "Pret",
            "Printed",
            "Printed Boot Cut",
            "Printed Bottoms",
            "Ready to wear",
            "Ready to wear dresses",
            "Readymade",
            "Readymade clothing",
            "RTW",
            "RTW-09th-May-24",
            "salwar kameez design",
            "Signature",
            "Single Piece",
            "size-chart",
            "stiched",
            "Stitch for you",
            "STITCH-FOR-YOU-RTW-09th-May-24",
            "Stitched",
            "Stitched for you",
            "Stitched-For-You-09th-May-24",
            "stitched-for-you-eid-2-24",
            "stitched-uns-fall-winter-23",
            "suit design",
            "Summer",
            "Summer 24",
            "Summer Clothing",
            "Summer Pret",
            "Summer Ready to Wear Clothing",
            "Summer RTW",
            "Summers",
            "Trouser",
            "Trousers",
            "U3PE-LX24V3-4 T",
            "U3PELX24V34T",
            "U3PELX24V34T-size-chart",
            "UAE_FREE_SHIPPING",
            "Unstitched-To-Stitched-June-sale-2024",
            "woman-all-products",
            "woman-culottes-trousers",
            "Women",
            "Women-all-products",
            "womens",
            "Womens Pret",
            "Womens Ready To Wear",
            "Womens Suit"
        ],
        "available": true
    },
    {
        "product_id": "adbf0e5e-a4cb-49d0-82b3-152a42f6346f",
        "product_url": "https://www.crossstitch.pk/products/alaina-1",
        "shopify_id": "6978112487489",
        "handle": "alaina-1",
        "title": "Alaina 1 Clutch",
        "vendor": "cross_stitch",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0178/4492/8612/files/4P2A5465.jpg?v=1694173773",
        "images": [
            "https://cdn.shopify.com/s/files/1/0178/4492/8612/files/4P2A5465.jpg?v=1694173773",
            "https://cdn.shopify.com/s/files/1/0178/4492/8612/files/4P2A5468.jpg?v=1694173773",
            "https://cdn.shopify.com/s/files/1/0178/4492/8612/files/4P2A5472.jpg?v=1694173773"
        ],
        "description": "Crafted in sleek satin, our clutch bag is adorned with layers of crystals and is also topped with a ball crystal clasp Color: Silver Material: Satin Silk Style: Hard-cased clutch Size: height 3.5 Inches width 7.4 InchesAccessories: Long Chain",
        "price": 6500,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "SILVER"
                ]
            }
        ],
        "tags": [
            "0123ACCBAGCLU0104",
            "ACCESSORIES",
            "BAGS",
            "CLUTCH",
            "COLLECTION: SS-23 ACC CLUTCH EDIT-1",
            "DCS: ACCBAGCLU",
            "EOS",
            "PRO TYP: CLUTCH",
            "promo-go",
            "SEASON: SS-23",
            "SEPT 2023"
        ],
        "available": true
    },
    {
        "product_id": "27b4d6e9-8e01-433d-86ec-960aab3fe897",
        "product_url": "https://generation.com.pk/products/s24t6025-pink",
        "shopify_id": "8305018274017",
        "handle": "s24t6025-pink",
        "title": "Timeless Romance Gota Galore Suit",
        "vendor": "generation",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24T6025_Pink.jpg?v=1711105839",
        "images": [
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24T6025_Pink.jpg?v=1711105839",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24T6025_Pink_1.jpg?v=1711105838",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24T6025_Pink_2.jpg?v=1711105839",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24T6025_Pink_3.jpg?v=1711105838",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24T6025_Pink_4.jpg?v=1711105838"
        ],
        "description": "Printed panelled short kurta with gota embelishments, paired with printed classic fit shalwar, adorned with gota and yarn dyed striped dupatta.MODEL DETAILS:Model is wearing size 8 and height is 5' 7''FABRICShirt: LawnDupatta: Yarn dyedLower: LawnLENGTHSleeve Length: FullShirt Length: Medium",
        "price": 10498,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "8",
                    "10",
                    "12",
                    "14",
                    "16"
                ]
            },
            {
                "name": "Colour",
                "position": 2,
                "values": [
                    "Pink"
                ]
            }
        ],
        "tags": [
            "Category_3-Piece",
            "Category_Suits",
            "cl-Hand Crafted",
            "Colour_Pink",
            "Eid-Blockbusters-24",
            "Embroidered 3 Piece",
            "Fabric_Lawn",
            "Hand Crafted",
            "Hand Crafted 3 Piece",
            "Length_Medium",
            "New-In",
            "PRICE_UNDER 12000",
            "Shirt Dupatta Shalwar 3 Piece",
            "Size_ 8",
            "Size_10",
            "Size_12",
            "Size_14",
            "Size_16",
            "Suits",
            "Suits-3-Piece",
            "Type_Embroidered"
        ],
        "available": true
    },
    {
        "product_id": "4f742269-9dbb-4915-81f7-9582f30d3def",
        "product_url": "https://pk.sapphireonline.pk/products/westtop03338-1",
        "shopify_id": "7466213867594",
        "handle": "westtop03338-1",
        "title": "Striped Loose Fit Shirt",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_4.jpg?v=1706784173",
        "images": [
            "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_4.jpg?v=1706784173",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_7.jpg?v=1706784173",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_1.jpg?v=1706784173",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_2.jpg?v=1706784173",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_3.jpg?v=1706784173",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/WESTTOP03338_5.jpg?v=1706784173"
        ],
        "description": "Printed shirt in cotton satin fabric. Full sleeves and front patch pocket.\nDetails:  Colour: Blue & White Fabric: 100% Cotton\nSize & Fit Model Height: 5 Feet 4 Inches Model Wears: S\n\n\n\n\nSize\nXS\nS\nM\nL\nXL\n\n\nLength\n70\n72\n74\n76\n78\n\n\nChest\n56\n58\n60\n62\n64\n\n\nBottom Opening\n58\n60\n62\n64\n66\n\n\nShoulder\n56\n58\n60\n62\n64\n\n\n",
        "price": 2593,
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
            }
        ],
        "tags": [
            "100% Cotton",
            "15-Percent-Tax",
            "3000 - 6000",
            "35% OFF",
            "35-restocked-july-sale-24",
            "Blue",
            "Bold Elegance-Women-Western-01st-Feb-24",
            "Button Down Shirt",
            "Button through shirt",
            "Cotton",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "Formal",
            "Formal Story",
            "home-edition",
            "June-sale-2024",
            "New-all-1st-Feb-24",
            "new-in",
            "new-in-west-sept-2020",
            "Office wear",
            "Printed",
            "Printed Button Down Shirt",
            "printed Shirt",
            "Restocking-April-sale-2024",
            "Sapphire West",
            "Shirt",
            "Shirts",
            "size-chart",
            "Spring Summer",
            "Spring Summer 24",
            "spring-bold-elegance-24",
            "Striped Loose-Fit Shirt",
            "Summer",
            "Summer Clothing",
            "Summers",
            "Top",
            "Tops",
            "Tops for Women",
            "UAE_FREE_SHIPPING",
            "West",
            "West Formals",
            "West Shirt",
            "West Top",
            "west-spring-24",
            "Western",
            "Western Shirt",
            "Western Wear",
            "WESTTOP03338",
            "WESTTOP03338-size-chart",
            "woman-all-products",
            "Women's West",
            "women-tops",
            "Women-Western-01st-Feb-24",
            "Women-Western-June-sale-2024"
        ],
        "available": true
    },
    {
        "product_id": "22a5f31e-9306-4a87-bb3a-33e67c98b0be",
        "product_url": "https://outfitters.com.pk//products/f0043-204",
        "shopify_id": "7809574600895",
        "handle": "f0043-204",
        "title": "Belted Button Through Maxi Shirt Dress",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204619_3_copy.jpg?v=1716437875",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204619_3_copy.jpg?v=1716437875",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204619_4_copy2.jpg?v=1717478668",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204619_4_copy.jpg?v=1717478668",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204005_2.jpg?v=1717478668",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204005_5.jpg?v=1717478668",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0043204005_4.jpg?v=1717478668"
        ],
        "description": "Fit Relaxed\nComfort all the way comfortably loose fit with drop shoulders that does not hug the body. Stands in the middle of an oversized and regular fit, making movement easy\n Composition & Care \n\n50% CTN 50% LINEN\nMachine wash up to 30C/86F, gentle cycle\nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 7490,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Navy Blue",
                    "Vanilla Ice"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "XS",
                    "S",
                    "M",
                    "L"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "SS-24"
                ]
            }
        ],
        "tags": [
            "2023-2024",
            "2024",
            "B13-SS24",
            "Casual",
            "Dresses",
            "JumpSuits",
            "L",
            "M",
            "PKR 7090 - PKR 7990",
            "Relaxed",
            "S",
            "SS-24",
            "Suits",
            "Summer",
            "Summer-24",
            "TN",
            "Top",
            "Vanilla Ice",
            "W-relx-maxidress-SimplifiedSizechart",
            "W-Suits-SS-24",
            "Women",
            "women-size-chart",
            "WomenSS-24",
            "XS"
        ],
        "available": true
    }
]