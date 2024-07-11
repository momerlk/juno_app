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

import {SwipeView} from "."
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
import {Logo , Back , toTitle , fmtPrice , shortTitle} from "./_common"
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
  currentIndex : number;
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
      currentIndex : 0,
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
    this.setState({currentIndex : 0})
    // closes on reload; major bug fix
    if(this.state.WSFeed !== null){
      this.state.WSFeed.close();
    }

    await AsyncStorage.setItem("filter" , "") // so that filter from previous session doesn't interfere
  }

  handleSwipe = async (action_type : string , _ : number) => {

    console.log(`products.length = ${this.state.products.length} , index = ${this.state.currentIndex}`)
    console.log(`WSFeed open = ${this.state.WSFeed?.open}`)

    const filterString = await AsyncStorage.getItem('filter');
    let filter = null;
    if(filterString !== null && filterString !== ""){
      filter = JSON.parse(filterString as string);
    }

    const { WSFeed, queryProducts } = this.state;
    const products = queryProducts;

    if (WSFeed) {
      if (products.length === 0) {
        return;
      }
      try {
        WSFeed.sendAction(
            action_type,
             products[this.state.currentIndex].product_id, 
            api.createQuery(null, filter)
          );
      } catch (e) {
        console.log(`products.length = ${products.length}, index = ${this.state.currentIndex}, error = ${e}`);
      }
    }

    this.setState({currentIndex : this.state.currentIndex + 1})
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
          paddingVertical : 28, 
          marginHorizontal : 30,
          }}>

          
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

        {/* Discover brands */}

        <View style={{marginVertical : size.verticalScale(10)}}></View>

        <Text style={{color : "white", fontFamily : "Poppins", fontSize : 18 , marginLeft : 20}}>Discover Brands</Text>

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
          data={[this.state.spotlight]}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
          // TODO : Test this fully
          // onRefresh={async () => {
          //   this.setState({loading : true});
          //   await this.getProducts();
          //   this.setState({loading : false});
          // }}
          // refreshing={this.state.loading}
        />
        </ScrollView>
          
        {/* Discover products */}
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
    this.setState({queryProducts : products , currentIndex : 0})
  }

  renderSearch(){
    return (
      <View style={{flex : 1, backgroundColor : "black"}}>
        <View style={{marginTop : size.verticalScale(10)}}></View>
        <Pressable onPress={() => this.setState({query : ""})} style={{
          display : "flex" , flexDirection : "row", marginBottom : 7, marginTop : 15 , paddingTop : 20
          }}>
          <View  
            style={{
              left : 10,
              top : 10,
              marginBottom : 10,
              }} >
              <Ionicons name="arrow-back" size={32} color="white"/>
          </View>
          <Text 
            style={{
              color : "white", 
              fontFamily : "Poppins", 
              fontSize : 22 , 
              marginLeft : 20,
              marginTop : 10,
            }} >
              Home
          </Text>
        </Pressable>
        <SwipeView 
          paddingTop={1}
          cards={this.state.queryProducts} 
          height={size.verticalScale(520)} 
          onSwipe={this.handleSwipe}
          onUndo={() => this.setState({currentIndex : this.state.currentIndex - 1})}
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

          topNav={false}
          bottomNav={true}
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


const mockData =[{
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