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


const mockData = [
    {
        "product_id": "231195ed-c1e4-499d-a600-904ee7d608a5",
        "product_url": "https://bonanzasatrangi.com/products/sas231p12-blue",
        "shopify_id": "8199757856931",
        "handle": "sas231p12-blue",
        "title": "Blue Yarn Dyed 1 Piece (Sas231P12)",
        "vendor": "bonanza_satrangi",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SAS231P12_1.jpg?v=1706524729",
        "description": "Stitched 1-Piece Suit\nShirt:Yarn Dyed Shirt Button Dawn Loose Fit Long Tunic With Shirt Collar And Cuffed Sleeves.\nModel Height: 5'7 And She Is Wearing Size 8",
        "price": 3680,
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
                    "BLUE"
                ]
            },
            {
                "name": "Design",
                "position": 3,
                "values": [
                    "SAS231P12"
                ]
            }
        ],
        "tags": [
            "1-Piece",
            "10",
            "12",
            "14",
            "16",
            "1Piece",
            "6",
            "8",
            "Alive",
            "Blue",
            "Collection: Summers",
            "Design-23",
            "designcode_SAS231P12-BLUE",
            "Female",
            "First10",
            "New Arrivals",
            "NewArrivals",
            "Piece-2023",
            "PKR 2500 - PKR 3999",
            "Pret",
            "Printed",
            "Ready To Wear",
            "sizechart_link:https://cdn.shopify.com/s/files/1/0464/1731/3955/files/SAS231P12.jpg",
            "Stitched",
            "Summer 2024",
            "SUMMER COLLECTION 2024",
            "Summers Pret",
            "WINTER COLLECTION '23",
            "Winter Collection 2023",
            "Women",
            "Women Ready to Wear",
            "Yarn Dyed"
        ],
        "available": true
    },
    {
        "product_id": "0d807f62-11f8-401c-b096-d7617f0ada9f",
        "product_url": "https://generation.com.pk/products/s24b4304-sky-blue",
        "shopify_id": "8314317209825",
        "handle": "s24b4304-sky-blue",
        "title": "Mother Of Pearls Asmani 2 Piece",
        "vendor": "generation",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24B4304_Skyblue.jpg?v=1711631258",
        "description": "Printed Kurta with gota details on neckline & sleeves, paired with tiered flared printed pants.MODEL DETAILS: Model is wearing size 8 and height is 5' 7''FABRICShirt: LawnLower: LawnLENGTHSleeve Length: FullShirt Length: Medium",
        "price": 6998,
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
                    "Sky Blue"
                ]
            }
        ],
        "tags": [
            "addon | black | s24b4304-black",
            "addon | red | s24b4304-red",
            "Category_2-Piece",
            "Colour_Sky Blue",
            "Fabric_Lawn",
            "Length_Medium",
            "Matching 2 Piece",
            "New-In",
            "Pre-Spring-2024",
            "PRICE_ UNDER 8000",
            "Printed 2 Piece",
            "s24b4304-sky-blue",
            "Shirt & Gharara 2 Piece",
            "Size_ 8",
            "Size_10",
            "Size_12",
            "Size_14",
            "Size_16",
            "Type_Printed"
        ],
        "available": true
    },
    {
        "product_id": "4e2e68d9-ba76-420f-95d2-1714f746995c",
        "product_url": "https://pk.ethnc.com/products/casual-suit-e4134-102-121-121",
        "shopify_id": "6950556008550",
        "handle": "casual-suit-e4134-102-121-121",
        "title": "Embroidered Suit (E4134/102/121)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E4134-102-121_1.jpg?v=1704435394",
        "description": "Details:An aesthetically appealing composition is portrayed on this graceful outfit rendered in mid olive shade. It features a classy shirt beautifully adorned with intricate embroidery at front and sleeves illustrating captivating floral designs in green hues. Illustrating an embossed canvas with floral designs, this sophisticated shirt is paired with a trendy trouser. Style this gorgeous outfit at formal gatherings this season.-Mid Olive Color-Lurex Fabric-Stitched Article-2 piece\nSize & Fit:-Model height is 5'6.-Model is wearing XS size.",
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
                    "Olive Green"
                ]
            }
        ],
        "tags": [
            "AZADISALEWOMENALL22MAR",
            "AZADISALEWOMENPret22MAR",
            "Casual",
            "Casual suit",
            "Casual'23",
            "Casual'24",
            "Casual-Full Price",
            "CGST15",
            "E4134/102/121-1-shirt-SimplifiedSizechart",
            "E4134/102/121-2-trouser-SimplifiedSizechart",
            "L",
            "M",
            "MSSALEWOMENALL8MAY",
            "MSSALEWomenCasual8MAY",
            "MSSALEWOMENPret8MAY",
            "ONGOING SS'24",
            "PKR 6000 - Above",
            "PRET SS'24",
            "S",
            "SS-24",
            "two piece pret",
            "Women New In",
            "WOMEN-F.P",
            "XS"
        ],
        "available": true
    },
    {
        "product_id": "d716266d-eefb-431a-8fdb-1b925207ae08",
        "product_url": "https://pk.sapphireonline.pk/products/2s-dy24v2-19-s-1",
        "shopify_id": "7587575365706",
        "handle": "2s-dy24v2-19-s-1",
        "title": "Printed Lawn Shirt",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/002SDY24V219_3.jpg?v=1714383633",
        "description": "Drop Shoulder ShirtCurate a playful summer look with our printed cream white, textured lawn drop shoulder shirt featuring a band neckline with placket.\nDetails: Printed Front, Printed Back, Full Sleeves, Band Neckline with a placketColour: Cream WhiteFabric: Textured Lawn\nSIZE & FITModel height: 5 Feet 6 InchesModel Wears: XS\n\n\n\nSize\nXS\nS\nM\nL\n\n\nLength\n33\n34\n35\n36\n\n\nChest\n22\n24\n26\n28\n\n\nFront Border\n24\n26\n28\n30\n\n\nBack Border\n24\n26\n28\n30\n\n\nArm hole\n10.5\n11\n11\n11.5\n\n\nSleeve Length\n24.5\n25\n25.5\n26\n\n\n",
        "price": 1943,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "XXS",
                    "XS",
                    "S",
                    "M",
                    "L",
                    "XL"
                ]
            }
        ],
        "tags": [
            "002SDY24V219",
            "002SDY24V219-size-chart",
            "1 Piece",
            "1000 - 3000",
            "15-Percent-Tax",
            "1PC",
            "2S-DY24V2-19 S",
            "35% OFF",
            "all-woman-ready-to-wear",
            "Ban",
            "Band",
            "Band Neckline",
            "brands in pakistan",
            "Casual",
            "clothes",
            "Daily",
            "Daily Clothing",
            "Daily Wear",
            "Daily Wear Clothing",
            "DAILY-RTW-29th-April-24",
            "Day to Day",
            "Drop Shoulder",
            "Drop Shoulder Shirt",
            "everything-June-sale-under-2000",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "fashion",
            "Full Sleeves",
            "home-edition",
            "June-sale-2024",
            "Kameez",
            "kapde",
            "kapdon ke design",
            "Kurta",
            "Kurti",
            "Ladies",
            "Ladies Pret",
            "Ladies Ready To Wear",
            "Ladies Stitched",
            "ladies suit design",
            "Lawn",
            "matching-separates",
            "Multi",
            "Multi Shaded",
            "Multicolored",
            "new dress design",
            "New in stitched 2024",
            "New-all-29th-April-24",
            "new-in-june-2022",
            "new-in-rtw-2021",
            "Office Wear",
            "One Piece",
            "pakistani dresses",
            "Pop",
            "Pop Art",
            "Pop Collection",
            "POP-ART-RTW-29th-April-24",
            "Pret",
            "Printed",
            "Ready to wear",
            "Ready to wear dresses",
            "Readymade",
            "Readymade clothing",
            "RTW",
            "RTW-29th-April-24",
            "rtw-boxy-kurta",
            "rtw-printed",
            "rtw-shirts",
            "rtw-short-kurti",
            "rtw-spring-summer-24",
            "RTW-Stitched-June-sale-2024",
            "salwar kameez design",
            "Shirt",
            "Shirts",
            "Single Piece",
            "size-chart",
            "stiched",
            "Stitched",
            "suit design",
            "Summer",
            "Summer 24",
            "Summer Clothing",
            "Summer Pret",
            "Summer Ready to Wear Clothing",
            "Summer RTW",
            "Summers",
            "Textured",
            "Textured Lawn",
            "UAE_FREE_SHIPPING",
            "woman-all-products",
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
        "product_id": "dab61366-aeb6-42e9-889f-42d98ac4c9f0",
        "product_url": "https://breakout.com.pk//products/4dsmd639-blu",
        "shopify_id": "7473808375862",
        "handle": "4dsmd639-blu",
        "title": "Stretch Slim Fit Denim",
        "vendor": "breakout",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/4DSMD639-BLU_1.jpg?v=1715673623",
        "description": "98% Cotton 2% Lycra",
        "price": 4499,
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
            "FS",
            "Garments",
            "MEN",
            "new"
        ],
        "available": true
    },
    {
        "product_id": "eee586d6-0690-438c-ba9a-3d5ad853f0e1",
        "product_url": "https://www.mariab.pk/products/mb-ef24-185-black",
        "shopify_id": "7918866825382",
        "handle": "mb-ef24-185-black",
        "title": "Dyed Tunic Dress | Mb Ef24 185",
        "vendor": "maria_b",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0620/8788/9062/files/MB-EF-24-185_3.jpg?v=1707745977",
        "description": "Behold the divine allure with our dyed tunic dress crafting vertical stripes heightened with exquisite button detailing.Details: Dyed Long Tunic Dress, Ban Overlapping Neckline With Button Detailing, Full Sleeves With Button DetailingColour: BlackFabric: Yarn DyedNote: Only Dry CleanModel is wearing size xs",
        "price": 3493,
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
            "2 Piece",
            "30-Jan-24",
            "_label_New",
            "dhlcode:6104 1900",
            "dhldes:Women Casual Shirt and Trouser",
            "Item_Tax_Rate:15",
            "M.Basics",
            "M.Basics Casuals",
            "M.Basics New Arrivals",
            "M.Basics Ready to Wear",
            "Monochrome",
            "Solids",
            "women-size-guide"
        ],
        "available": true
    },
    {
        "product_id": "514276a7-d50d-4cf7-a156-9290f09e407d",
        "product_url": "https://outfitters.com.pk//products/f0075-102",
        "shopify_id": "7556148068543",
        "handle": "f0075-102",
        "title": "Ribbed Sleeveless Sweater",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0075102901M_2.jpg?v=1698383333",
        "description": "(model-data)\nThe model is wearing size: L; Model height: 6.0ft\n(model-data-end)\n(main-data)\nFit Regular\n Composition & Care \n\n100% Turkish Acrylic\nMachine wash up to 30C/86F, gentle cycle\nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 2490,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Black",
                    "Antique White"
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
                    "WS-23"
                ]
            }
        ],
        "tags": [
            "2023",
            "2023-2023",
            "Antique White",
            "B12-WS23",
            "end-winter23",
            "FP-Slow",
            "M-Sweater",
            "Men",
            "men-size-chart",
            "men-winter-sale",
            "menspecialprices",
            "MenSweaterSale",
            "N//A",
            "NewMen",
            "PKR 4090 - PKR 4990",
            "revert-great-weeked-23",
            "s-seller",
            "saleagain24",
            "Sweaters",
            "Sweates",
            "Top",
            "Tops",
            "Winter",
            "Winter-23"
        ],
        "available": true
    },
    {
        "product_id": "2edd3995-f182-43e1-9e82-932c93e36ddc",
        "product_url": "https://outfitters.com.pk//products/f0201-208",
        "shopify_id": "7610651803839",
        "handle": "f0201-208",
        "title": "Cotton Trousers With Elastic Trims",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0201208121_lowersM_4_fc46825f-b96b-4215-9293-47afebf456a5.jpg?v=1706633784",
        "description": "(model-data)\nThe model is wearing size: S; Model height: 5.4ft\n(model-data-end)\n(main-data)\nFit Wide Leg\nComposition & Care\n\n100% Cotton\nMachine wash up to 30C/86F, gentle cycle\nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 3090,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Mid Olive"
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
                    "WS-23"
                ]
            }
        ],
        "tags": [
            "2022-2023",
            "2023",
            "B26-WS23",
            "Bottom",
            "fd-waly",
            "Joggers",
            "Mid Olive",
            "mss24",
            "N/A",
            "PKR 4090 - PKR 4990",
            "Trousers",
            "W-Trousers-",
            "Winter",
            "Winter-23",
            "Women",
            "women-size-chart",
            "womenspecialprices",
            "WomenTrouserSale"
        ],
        "available": true
    },
    {
        "product_id": "1aa61826-94bf-4071-9271-761e04253f6e",
        "product_url": "https://nishatlinen.com/products/pe24-398",
        "shopify_id": "8055358357703",
        "handle": "pe24-398",
        "title": "Basic Trousers   Pe24 398",
        "vendor": "nishat_linen",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/PE24-398-_1.jpg?v=1715233935",
        "description": "Add a layer of glamour to your summer outfit with this basic trousers from the latest pret summer collection.\nProduct DetailBasic Trousers\nTrousersLoose Straight Trousers With Lace DetailFabric: Cambric Color: Beige\nNote:Product color may vary slightly due to photographic lighting sources or monitor settings.",
        "price": 1990,
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
            "15%",
            "16-may-pret",
            "1pc",
            "31898",
            "all-pret-sum-2024",
            "all-sum-2024",
            "beige",
            "bottoms-sum-2024",
            "cambric",
            "l",
            "low-sum-2024-eid-2",
            "lower-sum-2024",
            "lux-pret-sum-2024-eid-2",
            "m",
            "new in low",
            "new-in-all",
            "rtw-16-may-2024",
            "s",
            "solids",
            "sum-2024-eid-2-all",
            "xl",
            "xs"
        ],
        "available": true
    }
]