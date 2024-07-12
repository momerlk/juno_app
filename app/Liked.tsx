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
import * as api from "./(tabs)/api";

import {Feather, Ionicons} from "@expo/vector-icons"
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Back , FastImageBackground} from "./(tabs)/_common";




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
  const height = 280;
  const width = 180;
  const textHeight = 80;
  return (
    <Pressable onPress={() => {
      router.navigate({
        pathname: "/details",
        params: props.item
      })
    }}>
      <FastImageBackground
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
            </FastImageBackground>
    </Pressable>
  )
}


interface HomeState {
  products : any[] | null;
  loading : boolean;
}

function half(arr : Array<any>){
  const n = arr.length;
  let n1 = 0; // n of first array
  // even
  if ((n%2) == 0){
    n1 = n/2;
  } else {
    n1 = n/2;
  }

  const data1 = arr.slice(0,n1);
  const data2 = arr.slice(n1,n);
  return {first : data1, second : data2}
}

export default class Home extends React.Component<{},HomeState> {
  constructor(props : any){
    super(props);
    this.state = {
      products : null, 
      loading : true,
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
      <ScrollView style={{backgroundColor : "#121212"}}>

        

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
          horizontal={true}
          
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={true}
          data={half(this.state.products).first.reverse()}
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

        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4,marginTop : 10,}}
          horizontal={true}
          
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={true}
          data={half(this.state.products).second.reverse()}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
        />
        </>
        }

      </ScrollView>
    )
  }
}


