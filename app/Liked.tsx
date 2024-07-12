import { LinearGradient } from "expo-linear-gradient";
import React , {useRef, useState, useEffect} from "react"
import {
  ScrollView , View , Text, StyleSheet, Image, ImageBackground,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import * as size from "react-native-size-matters";
import * as Font from "expo-font";
import * as api from "./(tabs)/api";


import {Feather, Ionicons} from "@expo/vector-icons"
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Back , FastImageBackground, asyncTimeout, fmtPrice, toTitle, shortTitle} from "./(tabs)/_common";


const SCREEN_WIDTH = Dimensions.get("screen").width;

// TODO : Add backend data gettting logic
// TODO : Add save progress logic

    
function Card(props : any){
  // TODO : Load this specific item in feed
  const height = 250;
  const width = (SCREEN_WIDTH/2) - size.moderateScale(8);
  const textHeight = 120;
  return (
    <Pressable onPress={() => {
      router.navigate({
        pathname: "/details",
        params: {
          data : JSON.stringify(props.item)
        }
      })
    }}>
      <FastImageBackground
              style={{
                height : size.verticalScale(height), 
                width : width,
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
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>

                
                        <Text style={{
                          fontSize: 14,
                          color : "white",
                          fontFamily : "Poppins",
                          marginHorizontal : 10,
                        }}>Rs. {fmtPrice(parseInt(props.item.price))}</Text>

                </View>
                </View>
              </LinearGradient>
            </FastImageBackground>
    </Pressable>
  )
}


interface HomeState {
  products : any[] | null;
  loading : boolean;
  refreshing : boolean;
}


export default class Home extends React.Component<{},HomeState> {
  constructor(props : any){
    super(props);
    this.state = {
      products : null, 
      loading : true,
      refreshing : false,
    }
  }

  async getProducts(){
    const products = await api.getLiked();
    if (products === null){
      this.setState({loading : false, products : null})
      return;
    }
    else {
      this.setState({products : products , loading : false})
    }
  }

  async componentDidMount(){
    await this.getProducts();
  }

  render(){
    if (this.state.loading){
      return <View style={{flex : 1,backgroundColor : "black", paddingTop : 40, paddingLeft : 20}}>
            
            <ActivityIndicator style={{
                position: 'absolute',
                left: '55%',
                top: '60%',
                transform: [{ translateX: -50 }, { translateY: -50 }],
            }} size={60} color="white"/>
        </View>
    }
    // TODO : Add activity indicator when loading
    return (
      <View style={{backgroundColor : "#121212", flex : 1,}}>

        

        <View style={{marginVertical : size.verticalScale(10)}}></View>
        <Back text="Liked Products"/>
        
        {this.state.products === null ? <Text style={{
          color : "white" , fontSize : 20,
          margin : 50,
          fontFamily : "Poppins"
        }}>No Liked Products.</Text> : 
        <>
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4}}
          numColumns={2}
          
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={true}
          data={this.state.products}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
          // TODO : Test this fully
          onRefresh={async () => {
            this.setState({refreshing : true});
            await this.getProducts();
            this.setState({refreshing : false});
          }}
          refreshing={this.state.refreshing}
        />
        </>
        }

      </View>
    )
  }
}


